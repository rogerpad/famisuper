import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TransactionTypesService } from './transaction-types.service';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionType } from './entities/transaction-type.entity';

@ApiTags('transaction-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transaction-types')
export class TransactionTypesController {
  constructor(private readonly transactionTypesService: TransactionTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de transacción' })
  @ApiResponse({ status: 201, description: 'Tipo de transacción creado exitosamente', type: TransactionType })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El tipo de transacción ya existe' })
  create(@Body() createTransactionTypeDto: CreateTransactionTypeDto) {
    return this.transactionTypesService.create(createTransactionTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de transacción' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de transacción', type: [TransactionType] })
  findAll() {
    return this.transactionTypesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener todos los tipos de transacción activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de transacción activos', type: [TransactionType] })
  findActive() {
    return this.transactionTypesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de transacción por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de transacción encontrado', type: TransactionType })
  @ApiResponse({ status: 404, description: 'Tipo de transacción no encontrado' })
  findOne(@Param('id') id: string) {
    return this.transactionTypesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de transacción' })
  @ApiResponse({ status: 200, description: 'Tipo de transacción actualizado exitosamente', type: TransactionType })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Tipo de transacción no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre del tipo de transacción ya existe' })
  update(@Param('id') id: string, @Body() updateTransactionTypeDto: UpdateTransactionTypeDto) {
    return this.transactionTypesService.update(+id, updateTransactionTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de transacción' })
  @ApiResponse({ status: 200, description: 'Tipo de transacción eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo de transacción no encontrado' })
  remove(@Param('id') id: string) {
    return this.transactionTypesService.remove(+id);
  }
}
