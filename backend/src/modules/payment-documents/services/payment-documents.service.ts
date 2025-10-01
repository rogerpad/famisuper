import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDocument } from '../entities/payment-document.entity';
import { CreatePaymentDocumentDto } from '../dto/create-payment-document.dto';
import { UpdatePaymentDocumentDto } from '../dto/update-payment-document.dto';

@Injectable()
export class PaymentDocumentsService {
  constructor(
    @InjectRepository(PaymentDocument)
    private paymentDocumentRepository: Repository<PaymentDocument>,
  ) {}

  async findAll(): Promise<PaymentDocument[]> {
    return this.paymentDocumentRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findAllActive(): Promise<PaymentDocument[]> {
    return this.paymentDocumentRepository.find({
      where: { activo: true },
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<PaymentDocument> {
    const paymentDocument = await this.paymentDocumentRepository.findOne({
      where: { id },
    });

    if (!paymentDocument) {
      throw new NotFoundException(`Documento de pago con ID ${id} no encontrado`);
    }

    return paymentDocument;
  }

  async create(createPaymentDocumentDto: CreatePaymentDocumentDto): Promise<PaymentDocument> {
    try {
      // Validar que el nombre no esté vacío
      if (!createPaymentDocumentDto.nombre || createPaymentDocumentDto.nombre.trim() === '') {
        throw new BadRequestException('El nombre del documento de pago es requerido');
      }
      
      // Crear objeto con solo los campos que existen en la tabla
      const newPaymentDocument = this.paymentDocumentRepository.create({
        nombre: createPaymentDocumentDto.nombre,
        descripcion: createPaymentDocumentDto.descripcion || null,
        activo: true
      });

      return await this.paymentDocumentRepository.save(newPaymentDocument);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el documento de pago: ${error.message || 'Error desconocido'}`);
    }
  }

  async update(id: number, updatePaymentDocumentDto: UpdatePaymentDocumentDto): Promise<PaymentDocument> {
    const paymentDocument = await this.findOne(id);

    try {
      // Actualizar solo los campos que existen en la tabla
      if (updatePaymentDocumentDto.nombre !== undefined) {
        paymentDocument.nombre = updatePaymentDocumentDto.nombre;
      }
      
      if (updatePaymentDocumentDto.descripcion !== undefined) {
        paymentDocument.descripcion = updatePaymentDocumentDto.descripcion;
      }
      
      return await this.paymentDocumentRepository.save(paymentDocument);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el documento de pago: ${error.message || 'Error desconocido'}`);
    }
  }

  async remove(id: number): Promise<void> {
    const paymentDocument = await this.findOne(id);
    
    try {
      await this.paymentDocumentRepository.remove(paymentDocument);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar el documento de pago: ${error.message || 'Error desconocido'}`);
    }
  }

  async toggleStatus(id: number): Promise<PaymentDocument> {
    const paymentDocument = await this.findOne(id);
    
    try {
      paymentDocument.activo = !paymentDocument.activo;
      return await this.paymentDocumentRepository.save(paymentDocument);
    } catch (error) {
      throw new BadRequestException(`Error al cambiar el estado del documento de pago: ${error.message || 'Error desconocido'}`);
    }
  }
}
