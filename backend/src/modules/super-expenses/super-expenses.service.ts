import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperExpense } from './entities/super-expense.entity';
import { CreateSuperExpenseDto, UpdateSuperExpenseDto } from './dto';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Injectable()
export class SuperExpensesService {
  constructor(
    @InjectRepository(SuperExpense)
    private superExpenseRepository: Repository<SuperExpense>,
    @InjectRepository(UsuarioTurno)
    private usuarioTurnoRepository: Repository<UsuarioTurno>,
  ) {}

  async create(createSuperExpenseDto: CreateSuperExpenseDto, userId: number): Promise<SuperExpense> {
    try {
      console.log('Servicio - Datos recibidos:', JSON.stringify(createSuperExpenseDto));
      console.log('Servicio - Usuario ID:', userId);
      
      // Obtener el turno activo del usuario para obtener cajaNumero
      const turnoActivo = await this.usuarioTurnoRepository.findOne({
        where: { usuarioId: userId, activo: true }
      });
      
      const cajaNumero = turnoActivo?.cajaNumero || null;
      console.log('Caja numero del turno activo:', cajaNumero);
      
      // Verificar que el usuario exista
      const userExists = await this.superExpenseRepository.query(
        'SELECT COUNT(*) as count FROM tbl_usuarios WHERE id = $1',
        [userId]
      );
      console.log('Verificación usuarioId:', userExists);
      
      if (parseInt(userExists[0].count) === 0) {
        throw new Error(`El usuario con ID ${userId} no existe`);
      }
      
      // Verificar que el tipo de egreso exista
      const tipoEgresoExists = await this.superExpenseRepository.query(
        'SELECT COUNT(*) as count FROM tbl_tipo_egresos WHERE id = $1',
        [createSuperExpenseDto.tipoEgresoId]
      );
      console.log('Verificación tipoEgresoId:', tipoEgresoExists);
      
      if (parseInt(tipoEgresoExists[0].count) === 0) {
        throw new Error(`El tipo de egreso con ID ${createSuperExpenseDto.tipoEgresoId} no existe`);
      }
      
      // Verificar que la forma de pago exista
      const formaPagoExists = await this.superExpenseRepository.query(
        'SELECT COUNT(*) as count FROM tbl_forma_pagos WHERE id = $1',
        [createSuperExpenseDto.formaPagoId]
      );
      console.log('Verificación formaPagoId:', formaPagoExists);
      
      if (parseInt(formaPagoExists[0].count) === 0) {
        throw new Error(`La forma de pago con ID ${createSuperExpenseDto.formaPagoId} no existe`);
      }
      
      // Verificar que el documento de pago exista si se proporciona
      if (createSuperExpenseDto.documentoPagoId) {
        const documentoPagoExists = await this.superExpenseRepository.query(
          'SELECT COUNT(*) as count FROM tbl_documento_pagos WHERE id = $1',
          [createSuperExpenseDto.documentoPagoId]
        );
        console.log('Verificación documentoPagoId:', documentoPagoExists);
        
        if (parseInt(documentoPagoExists[0].count) === 0) {
          throw new Error(`El documento de pago con ID ${createSuperExpenseDto.documentoPagoId} no existe`);
        }
      }
      
      // Formatear la fecha correctamente para PostgreSQL
      let fechaEgreso;
      try {
        const fecha = new Date(createSuperExpenseDto.fechaEgreso);
        // Verificar que la fecha sea válida
        if (isNaN(fecha.getTime())) {
          throw new Error('Fecha inválida');
        }
        
        // Formatear como YYYY-MM-DD para el campo date
        fechaEgreso = fecha.toISOString().split('T')[0];
        console.log('Fecha formateada:', fechaEgreso);
      } catch (dateError) {
        console.error('Error al procesar la fecha:', dateError);
        throw new Error(`Error al procesar la fecha: ${dateError.message}`);
      }
      
      // Validar el formato de la hora (HH:MM:SS o HH:MM)
      let horaFormateada;
      try {
        // Verificar si la hora tiene el formato correcto
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!horaRegex.test(createSuperExpenseDto.hora)) {
          throw new Error('Formato de hora inválido. Use HH:MM:SS o HH:MM');
        }
        
        // Asegurarse de que tenga el formato HH:MM:SS
        horaFormateada = createSuperExpenseDto.hora;
        if (horaFormateada.split(':').length === 2) {
          horaFormateada += ':00'; // Agregar segundos si no están presentes
        }
        
        console.log('Hora formateada:', horaFormateada);
      } catch (timeError) {
        console.error('Error al procesar la hora:', timeError);
        throw new Error(`Error al procesar la hora: ${timeError.message}`);
      }
      
      // Crear objeto con datos limpios para insertar
      const cleanData = {
        tipoEgresoId: createSuperExpenseDto.tipoEgresoId,
        descripcionEgreso: createSuperExpenseDto.descripcionEgreso,
        documentoPagoId: createSuperExpenseDto.documentoPagoId,
        nroFactura: createSuperExpenseDto.nroFactura,
        excento: createSuperExpenseDto.excento || 0,
        gravado: createSuperExpenseDto.gravado || 0,
        impuesto: createSuperExpenseDto.impuesto || 0,
        total: createSuperExpenseDto.total,
        formaPagoId: createSuperExpenseDto.formaPagoId,
        fechaEgreso: fechaEgreso,
        hora: horaFormateada,
        usuarioId: userId.toString(),
        activo: createSuperExpenseDto.activo !== undefined ? createSuperExpenseDto.activo : true
      };
      
      console.log('Servicio - Datos limpios:', cleanData);
      
      // Insertar directamente usando SQL para mayor control y visibilidad
      try {
        const query = `
          INSERT INTO tbl_egresos_super (
            usuario_id, tipo_egreso_id, descripcion_egreso, documento_pago_id, 
            nro_factura, excento, gravado, impuesto, total, forma_pago_id, 
            fecha_egreso, hora, activo, caja_numero
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;
        
        // Normalizar los valores para evitar errores de tipo en la base de datos
        // Si nroFactura es una cadena vacía, establecerlo como null
        const nroFactura = cleanData.nroFactura === '' ? null : cleanData.nroFactura;
        
        const params = [
          cleanData.usuarioId,
          cleanData.tipoEgresoId,
          cleanData.descripcionEgreso,
          cleanData.documentoPagoId,
          nroFactura, // Usar el valor normalizado
          cleanData.excento,
          cleanData.gravado,
          cleanData.impuesto,
          cleanData.total,
          cleanData.formaPagoId,
          cleanData.fechaEgreso,
          cleanData.hora,
          cleanData.activo,
          cajaNumero // Agregar caja_numero del turno activo
        ];
        
        console.log('query:', query);
        console.log('query params:', params);
        
        const result = await this.superExpenseRepository.query(query, params);
        console.log('Inserción exitosa:', result[0]);
        return result[0];
      } catch (sqlError) {
        console.log('query failed:', sqlError.query);
        console.log('error:', sqlError);
        throw new Error(`Error al insertar en la base de datos: ${sqlError.message}`);
      }
    } catch (error) {
      console.error('Servicio - Error al crear egreso de super:', error);
      console.error('Servicio - Mensaje de error:', error.message);
      console.error('Servicio - Stack trace:', error.stack);
      throw error;
    }
  }

  async findAll(showInactive: boolean = false): Promise<SuperExpense[]> {
    const query = this.superExpenseRepository.createQueryBuilder('superExpense')
      .leftJoinAndSelect('superExpense.tipoEgreso', 'tipoEgreso')
      .leftJoinAndSelect('superExpense.documentoPago', 'documentoPago')
      .leftJoinAndSelect('superExpense.formaPago', 'formaPago')
      .leftJoinAndSelect('superExpense.usuario', 'usuario');

    if (!showInactive) {
      query.where('superExpense.activo = :activo', { activo: true });
    }

    return query.orderBy('superExpense.fechaEgreso', 'DESC').getMany();
  }

  async findOne(id: number): Promise<SuperExpense> {
    const superExpense = await this.superExpenseRepository.findOne({
      where: { id },
      relations: ['tipoEgreso', 'documentoPago', 'formaPago', 'usuario'],
    });

    if (!superExpense) {
      throw new NotFoundException(`Egreso de Super con ID ${id} no encontrado`);
    }

    return superExpense;
  }

  async update(id: number, updateSuperExpenseDto: UpdateSuperExpenseDto): Promise<SuperExpense> {
    try {
      console.log('========== INICIO ACTUALIZACIÓN EGRESO SUPER ==========');
      console.log('Servicio - Actualizando egreso de super ID:', id);
      console.log('Servicio - Datos recibidos:', JSON.stringify(updateSuperExpenseDto));
      
      // Verificar que el egreso exista
      const superExpense = await this.findOne(id);
      if (!superExpense) {
        console.log(`Egreso con ID ${id} no encontrado`);
        throw new NotFoundException(`Egreso de Super con ID ${id} no encontrado`);
      }
      
      console.log('Egreso actual encontrado:', JSON.stringify(superExpense));
      
      // Crear una copia limpia de los datos a actualizar
      const cleanUpdateData: any = {};
      
      // Procesar solo los campos proporcionados
      if (updateSuperExpenseDto.tipoEgresoId !== undefined) {
        try {
          cleanUpdateData.tipoEgresoId = Number(updateSuperExpenseDto.tipoEgresoId);
          if (isNaN(cleanUpdateData.tipoEgresoId)) {
            throw new Error('tipoEgresoId debe ser un número válido');
          }
        } catch (error) {
          console.error('Error al procesar tipoEgresoId:', error);
          throw new BadRequestException('tipoEgresoId debe ser un número válido');
        }
      }
      
      if (updateSuperExpenseDto.descripcionEgreso !== undefined) {
        cleanUpdateData.descripcionEgreso = updateSuperExpenseDto.descripcionEgreso;
      }
      
      if (updateSuperExpenseDto.documentoPagoId !== undefined) {
        try {
          console.log('Procesando documentoPagoId:', updateSuperExpenseDto.documentoPagoId);
          console.log('Tipo de documentoPagoId:', typeof updateSuperExpenseDto.documentoPagoId);
          
          // Convertir a string para poder hacer comparaciones seguras
          const docPagoIdStr = String(updateSuperExpenseDto.documentoPagoId);
          console.log('documentoPagoId como string:', docPagoIdStr);
          
          if (updateSuperExpenseDto.documentoPagoId === null || docPagoIdStr === '' || docPagoIdStr === '0') {
            console.log('Asignando documentoPagoId como null');
            cleanUpdateData.documentoPagoId = null;
          } else {
            cleanUpdateData.documentoPagoId = Number(updateSuperExpenseDto.documentoPagoId);
            console.log('documentoPagoId convertido a número:', cleanUpdateData.documentoPagoId);
            if (isNaN(cleanUpdateData.documentoPagoId)) {
              throw new Error('documentoPagoId debe ser un número válido o null');
            }
          }
        } catch (error) {
          console.error('Error al procesar documentoPagoId:', error);
          throw new BadRequestException('documentoPagoId debe ser un número válido o null');
        }
      } else {
        console.log('documentoPagoId no está definido en la solicitud de actualización');
      }
      
      if (updateSuperExpenseDto.nroFactura !== undefined) {
        console.log('Procesando nroFactura:', updateSuperExpenseDto.nroFactura);
        console.log('Tipo de nroFactura:', typeof updateSuperExpenseDto.nroFactura);
        
        // Si nroFactura es una cadena vacía, establecerlo como null
        cleanUpdateData.nroFactura = updateSuperExpenseDto.nroFactura === '' ? null : updateSuperExpenseDto.nroFactura;
        console.log('nroFactura procesado:', cleanUpdateData.nroFactura);
      } else {
        console.log('nroFactura no está definido en la solicitud de actualización');
      }
      
      if (updateSuperExpenseDto.excento !== undefined) {
        try {
          cleanUpdateData.excento = Number(updateSuperExpenseDto.excento || 0);
          if (isNaN(cleanUpdateData.excento)) {
            throw new Error('excento debe ser un número válido');
          }
        } catch (error) {
          console.error('Error al procesar excento:', error);
          throw new BadRequestException('excento debe ser un número válido');
        }
      }
      
      if (updateSuperExpenseDto.gravado !== undefined) {
        try {
          cleanUpdateData.gravado = Number(updateSuperExpenseDto.gravado || 0);
          if (isNaN(cleanUpdateData.gravado)) {
            throw new Error('gravado debe ser un número válido');
          }
        } catch (error) {
          console.error('Error al procesar gravado:', error);
          throw new BadRequestException('gravado debe ser un número válido');
        }
      }
      
      if (updateSuperExpenseDto.impuesto !== undefined) {
        try {
          cleanUpdateData.impuesto = Number(updateSuperExpenseDto.impuesto || 0);
          if (isNaN(cleanUpdateData.impuesto)) {
            throw new Error('impuesto debe ser un número válido');
          }
        } catch (error) {
          console.error('Error al procesar impuesto:', error);
          throw new BadRequestException('impuesto debe ser un número válido');
        }
      }
      
      if (updateSuperExpenseDto.total !== undefined) {
        try {
          cleanUpdateData.total = Number(updateSuperExpenseDto.total);
          if (isNaN(cleanUpdateData.total)) {
            throw new Error('total debe ser un número válido');
          }
        } catch (error) {
          console.error('Error al procesar total:', error);
          throw new BadRequestException('total debe ser un número válido');
        }
      }
      
      if (updateSuperExpenseDto.formaPagoId !== undefined) {
        try {
          cleanUpdateData.formaPagoId = Number(updateSuperExpenseDto.formaPagoId);
          if (isNaN(cleanUpdateData.formaPagoId)) {
            throw new Error('formaPagoId debe ser un número válido');
          }
        } catch (error) {
          console.error('Error al procesar formaPagoId:', error);
          throw new BadRequestException('formaPagoId debe ser un número válido');
        }
      }
      
      if (updateSuperExpenseDto.activo !== undefined) {
        cleanUpdateData.activo = updateSuperExpenseDto.activo;
      }
      
      // Procesar la fecha si está presente
      if (updateSuperExpenseDto.fechaEgreso !== undefined) {
        try {
          const fecha = new Date(updateSuperExpenseDto.fechaEgreso);
          if (isNaN(fecha.getTime())) {
            throw new Error('Fecha inválida');
          }
          
          // Formatear como YYYY-MM-DD para el campo date
          cleanUpdateData.fechaEgreso = fecha.toISOString().split('T')[0];
          console.log('Fecha formateada:', cleanUpdateData.fechaEgreso);
        } catch (dateError) {
          console.error('Error al procesar la fecha:', dateError);
          throw new Error(`Error al procesar la fecha: ${dateError.message}`);
        }
      }
      
      // Procesar la hora si está presente
      if (updateSuperExpenseDto.hora !== undefined) {
        try {
          // Verificar si la hora tiene el formato correcto
          const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
          if (!horaRegex.test(updateSuperExpenseDto.hora)) {
            throw new Error('Formato de hora inválido. Use HH:MM:SS o HH:MM');
          }
          
          // Asegurarse de que tenga el formato HH:MM:SS
          let horaFormateada = updateSuperExpenseDto.hora;
          if (horaFormateada.split(':').length === 2) {
            horaFormateada += ':00'; // Agregar segundos si no están presentes
          }
          
          cleanUpdateData.hora = horaFormateada;
          console.log('Hora formateada:', horaFormateada);
        } catch (timeError) {
          console.error('Error al procesar la hora:', timeError);
          throw new Error(`Error al procesar la hora: ${timeError.message}`);
        }
      } else {
        // Si no se proporciona hora en la actualización, mantener la hora actual
        // Esto evita que la validación falle cuando se actualiza parcialmente
        cleanUpdateData.hora = superExpense.hora;
        console.log('Manteniendo hora actual:', superExpense.hora);
      }
      
      console.log('Servicio - Datos limpios para actualización:', cleanUpdateData);
      
      try {
        // IMPORTANTE: Asegurar que los IDs estén presentes y sean válidos
        // Si se está actualizando tipoEgresoId, usar el nuevo valor, sino mantener el existente
        if (cleanUpdateData.tipoEgresoId !== undefined) {
          // Ya se validó que sea un número en el procesamiento anterior
          if (cleanUpdateData.tipoEgresoId === 0) {
            throw new BadRequestException('El tipo de egreso es obligatorio');
          }
        } else {
          // Si no se está actualizando, asegurar que el valor existente sea válido
          if (!superExpense.tipoEgresoId) {
            throw new BadRequestException('El tipo de egreso es obligatorio');
          }
        }
        
        // Validar descripción
        if (!superExpense.descripcionEgreso && !cleanUpdateData.descripcionEgreso) {
          throw new BadRequestException('La descripción del egreso es obligatoria');
        }
        
        // Validar formaPagoId
        if (cleanUpdateData.formaPagoId !== undefined) {
          if (cleanUpdateData.formaPagoId === 0) {
            throw new BadRequestException('La forma de pago es obligatoria');
          }
        } else {
          // Si no se está actualizando, asegurar que el valor existente sea válido
          if (!superExpense.formaPagoId) {
            throw new BadRequestException('La forma de pago es obligatoria');
          }
        }
        
        // Documento de pago puede ser opcional dependiendo del tipo de egreso
        // No validamos obligatoriedad aquí, eso se maneja en el frontend
        
        console.log('Servicio - Datos limpios para actualizar:', JSON.stringify(cleanUpdateData));
        
        // Usar update en lugar de save para asegurar que todos los campos se actualicen
        await this.superExpenseRepository.update(id, cleanUpdateData);
        console.log('Servicio - Update ejecutado con éxito');
        
        // Obtener el registro actualizado
        const updatedExpense = await this.findOne(id);
        if (!updatedExpense) {
          throw new NotFoundException(`Egreso de Super con ID ${id} no encontrado después de actualizar`);
        }
        
        console.log('Servicio - Egreso actualizado:', JSON.stringify(updatedExpense));
        console.log('Servicio - Egreso actualizado exitosamente');
        return updatedExpense;
      } catch (dbError) {
        console.error('Servicio - Error al guardar en la base de datos:', dbError);
        console.error('Servicio - Mensaje de error DB:', dbError.message);
        console.error('Servicio - Stack trace DB:', dbError.stack);
        
        if (dbError.code) {
          console.error('Servicio - Código de error SQL:', dbError.code);
        }
        
        if (dbError instanceof BadRequestException) {
          throw dbError; // Reenviar excepciones de validación
        } else {
          throw new BadRequestException(`Error al actualizar egreso de super: ${dbError.message}`);
        }
      }
    } catch (error) {
      console.error('Servicio - Error al actualizar egreso de super:', error);
      console.error('Servicio - Mensaje de error:', error.message);
      console.error('Servicio - Stack trace:', error.stack);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error; // Reenviar excepciones HTTP ya formateadas
      } else {
        throw new BadRequestException(`Error al actualizar egreso de super: ${error.message}`);
      }
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.superExpenseRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Egreso de Super con ID ${id} no encontrado`);
    }
  }

  async toggleActive(id: number): Promise<SuperExpense> {
    const superExpense = await this.findOne(id);
    superExpense.activo = !superExpense.activo;
    
    return this.superExpenseRepository.save(superExpense);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SuperExpense[]> {
    return this.superExpenseRepository.createQueryBuilder('superExpense')
      .leftJoinAndSelect('superExpense.tipoEgreso', 'tipoEgreso')
      .leftJoinAndSelect('superExpense.documentoPago', 'documentoPago')
      .leftJoinAndSelect('superExpense.formaPago', 'formaPago')
      .leftJoinAndSelect('superExpense.usuario', 'usuario')
      .where('superExpense.fechaEgreso BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      })
      .orderBy('superExpense.fechaEgreso', 'DESC')
      .getMany();
  }

  /**
   * Obtiene la suma del campo 'total' de los registros activos de tipo 'Pago de Productos'
   * y forma de pago 'Efectivo' (filtrado por caja)
   * @returns Suma total de los pagos de productos en efectivo activos
   */
  async getSumPagoProductosEfectivo(cajaNumero?: number): Promise<number> {
    try {
      console.log(`[SuperExpensesService] Calculando suma de pago productos en efectivo - Caja: ${cajaNumero || 'Todas'}`);
      
      // Primero obtenemos el ID del tipo de egreso 'Pago de Productos'
      const tipoEgresoResult = await this.superExpenseRepository.query(
        `SELECT id FROM tbl_tipo_egresos WHERE nombre ILIKE '%pago de producto%' AND activo = true LIMIT 1`
      );
      
      if (!tipoEgresoResult || tipoEgresoResult.length === 0) {
        console.log('No se encontró el tipo de egreso "Pago de Productos"');
        return 0;
      }
      const tipoEgresoId = tipoEgresoResult[0].id;
      
      // Luego obtenemos el ID de la forma de pago 'Efectivo'
      const formaPagoResult = await this.superExpenseRepository.query(
        `SELECT id FROM tbl_forma_pagos WHERE nombre ILIKE '%efectivo%' AND activo = true LIMIT 1`
      );
      
      if (!formaPagoResult || formaPagoResult.length === 0) {
        console.log('No se encontró la forma de pago "Efectivo"');
        return 0;
      }
      const formaPagoId = formaPagoResult[0].id;
      
      // Ahora realizamos la consulta para obtener la suma
      const queryBuilder = this.superExpenseRepository.createQueryBuilder('superExpense')
        .select('SUM(superExpense.total)', 'suma')
        .where('superExpense.tipoEgresoId = :tipoEgresoId', { tipoEgresoId })
        .andWhere('superExpense.formaPagoId = :formaPagoId', { formaPagoId })
        .andWhere('superExpense.activo = :activo', { activo: true });
      
      // Si se proporciona cajaNumero, filtrar por esa caja específica
      if (cajaNumero) {
        queryBuilder.andWhere('superExpense.cajaNumero = :cajaNumero', { cajaNumero });
      }
      
      const result = await queryBuilder.getRawOne();
      
      const total = result && result.suma ? parseFloat(result.suma) : 0;
      console.log(`[SuperExpensesService] Suma de pago productos obtenida: ${total}`);
      return total;
    } catch (error) {
      console.error('Error al obtener la suma de pagos de productos en efectivo:', error);
      return 0;
    }
  }

  /**
   * Obtiene la suma del campo 'total' de los registros activos de tipo 'Gasto'
   * y forma de pago 'Efectivo' (filtrado por caja)
   * @returns Suma total de los gastos en efectivo activos
   */
  async getSumGastosEfectivo(cajaNumero?: number): Promise<number> {
    try {
      console.log(`[SuperExpensesService] Calculando suma de gastos en efectivo - Caja: ${cajaNumero || 'Todas'}`);
      
      // Primero obtenemos el ID del tipo de egreso 'Gasto'
      const tipoEgresoResult = await this.superExpenseRepository.query(
        `SELECT id FROM tbl_tipo_egresos WHERE nombre ILIKE '%gasto%' AND activo = true LIMIT 1`
      );
      
      if (!tipoEgresoResult || tipoEgresoResult.length === 0) {
        console.log('No se encontró el tipo de egreso "Gasto"');
        return 0;
      }
      const tipoEgresoId = tipoEgresoResult[0].id;
      
      // Luego obtenemos el ID de la forma de pago 'Efectivo'
      const formaPagoResult = await this.superExpenseRepository.query(
        `SELECT id FROM tbl_forma_pagos WHERE nombre ILIKE '%efectivo%' AND activo = true LIMIT 1`
      );
      
      if (!formaPagoResult || formaPagoResult.length === 0) {
        console.log('No se encontró la forma de pago "Efectivo"');
        return 0;
      }
      const formaPagoId = formaPagoResult[0].id;
      
      // Ahora realizamos la consulta para obtener la suma
      const queryBuilder = this.superExpenseRepository.createQueryBuilder('superExpense')
        .select('SUM(superExpense.total)', 'suma')
        .where('superExpense.tipoEgresoId = :tipoEgresoId', { tipoEgresoId })
        .andWhere('superExpense.formaPagoId = :formaPagoId', { formaPagoId })
        .andWhere('superExpense.activo = :activo', { activo: true });
      
      // Si se proporciona cajaNumero, filtrar por esa caja específica
      if (cajaNumero) {
        queryBuilder.andWhere('superExpense.cajaNumero = :cajaNumero', { cajaNumero });
      }
      
      const result = await queryBuilder.getRawOne();
      
      const total = result && result.suma ? parseFloat(result.suma) : 0;
      console.log(`[SuperExpensesService] Suma de gastos obtenida: ${total}`);
      return total;
    } catch (error) {
      console.error('Error al obtener la suma de gastos en efectivo:', error);
      return 0;
    }
  }
}
