import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AgentClosingsService } from './agent-closings.service';
import { CreateAgentClosingDto } from './dto/create-agent-closing.dto';
import { UpdateAgentClosingDto } from './dto/update-agent-closing.dto';
import { AdjustClosingDto } from './dto/adjust-closing.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('agent-closings')
@Controller('agent-closings')
@UseGuards(JwtAuthGuard)
export class AgentClosingsController {
  constructor(private readonly agentClosingsService: AgentClosingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cierre final de agente' })
  @ApiResponse({ status: 201, description: 'El cierre ha sido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Conflicto - Ya existe un cierre para este agente en la misma fecha' })
  create(@Body() createAgentClosingDto: CreateAgentClosingDto) {
    return this.agentClosingsService.create(createAgentClosingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cierres finales de agentes' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de cierres obtenida exitosamente' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.agentClosingsService.findAll(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cierre final de agente por ID' })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ status: 200, description: 'Cierre encontrado' })
  @ApiResponse({ status: 404, description: 'Cierre no encontrado' })
  findOne(@Param('id') id: string) {
    return this.agentClosingsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cierre final de agente' })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ status: 200, description: 'Cierre actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cierre no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto - Ya existe un cierre para este agente en la misma fecha' })
  update(@Param('id') id: string, @Body() updateAgentClosingDto: UpdateAgentClosingDto) {
    return this.agentClosingsService.update(+id, updateAgentClosingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cierre final de agente' })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ status: 200, description: 'Cierre eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cierre no encontrado' })
  remove(@Param('id') id: string) {
    return this.agentClosingsService.remove(+id);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Realizar un ajuste a un cierre inactivo' })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ status: 200, description: 'Ajuste realizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cierre no encontrado' })
  @ApiResponse({ status: 409, description: 'Solo se pueden ajustar cierres inactivos' })
  adjustClosing(
    @Param('id') id: string,
    @Body() adjustClosingDto: AdjustClosingDto,
    @Request() req
  ) {
    console.log('[ADJUST-CONTROLLER] User object:', JSON.stringify(req.user));
    const userId = req.user.id; // Usar id en lugar de userId
    console.log('[ADJUST-CONTROLLER] Using userId:', userId);
    return this.agentClosingsService.adjustClosing(+id, userId, adjustClosingDto);
  }

  @Get(':id/adjustments')
  @ApiOperation({ summary: 'Obtener historial de ajustes de un cierre' })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ status: 200, description: 'Historial de ajustes obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Cierre no encontrado' })
  getClosingAdjustments(@Param('id') id: string) {
    return this.agentClosingsService.getClosingAdjustments(+id);
  }

  @Get('providers/agents')
  @ApiOperation({ summary: 'Obtener todos los proveedores de tipo agente' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores de tipo agente obtenida exitosamente' })
  getAgentProviders() {
    return this.agentClosingsService.getAgentProviders();
  }
}
