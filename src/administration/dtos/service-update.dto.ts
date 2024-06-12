import { PartialType } from "@nestjs/mapped-types";
import { CreateServiceDto } from "./service-create.dto";

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
