import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdditionalLoanService } from './additional-loan.service';
import { 
  CreateAdditionalLoanDto, 
  UpdateAdditionalLoanDto, 
  AdditionalLoanDto 
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('adicionales-prestamos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdditionalLoanController {
  constructor(private readonly additionalLoanService: AdditionalLoanService) {}

  @Post()
  @RequirePermissions('crear_editar_adic_prest')
  create(@Body() createAdditionalLoanDto: CreateAdditionalLoanDto): Promise<AdditionalLoanDto> {
    return this.additionalLoanService.create(createAdditionalLoanDto);
  }

  @Get()
  @RequirePermissions('ver_adic_presta')
  findAll(
    @Query('acuerdo') acuerdo?: string,
    @Query('origen') origen?: string,
    @Query('activo') activo?: string,
  ): Promise<AdditionalLoanDto[]> {
    // Convertir el string 'true'/'false' a boolean si existe
    const activoBoolean = activo ? activo === 'true' : undefined;
    
    return this.additionalLoanService.findAll({
      acuerdo,
      origen,
      activo: activoBoolean,
    });
  }

  @Get(':id')
  @RequirePermissions('ver_adic_presta')
  findOne(@Param('id') id: string): Promise<AdditionalLoanDto> {
    return this.additionalLoanService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('crear_editar_adic_prest')
  update(
    @Param('id') id: string, 
    @Body() updateAdditionalLoanDto: UpdateAdditionalLoanDto
  ): Promise<AdditionalLoanDto> {
    return this.additionalLoanService.update(+id, updateAdditionalLoanDto);
  }

  @Delete(':id')
  @RequirePermissions('eliminar_adic_prest')
  remove(@Param('id') id: string): Promise<void> {
    return this.additionalLoanService.remove(+id);
  }
}
