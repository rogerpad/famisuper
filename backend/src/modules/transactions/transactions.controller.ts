import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva transacción' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente', type: Transaction })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Agente o tipo de transacción no encontrado' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las transacciones' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones', type: [Transaction] })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Obtener transacciones por rango de fechas' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Fecha inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Fecha final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones en el rango de fechas', type: [Transaction] })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.findByDateRange(startDate, endDate);
  }

  @Get('agent/:id')
  @ApiOperation({ summary: 'Obtener transacciones por agente' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones del agente', type: [Transaction] })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  findByAgent(@Param('id') id: string) {
    return this.transactionsService.findByAgent(+id);
  }

  @Get('type/:id')
  @ApiOperation({ summary: 'Obtener transacciones por tipo de transacción' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones del tipo especificado', type: [Transaction] })
  @ApiResponse({ status: 404, description: 'Tipo de transacción no encontrado' })
  findByTransactionType(@Param('id') id: string) {
    return this.transactionsService.findByTransactionType(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una transacción por ID' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una transacción' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada exitosamente', type: Transaction })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Transacción, agente o tipo de transacción no encontrado' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una transacción' })
  @ApiResponse({ status: 200, description: 'Transacción eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
