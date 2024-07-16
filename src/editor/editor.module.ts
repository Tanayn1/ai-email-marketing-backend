import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';

@Module({
  providers: [EditorService],
  controllers: [EditorController]
})
export class EditorModule {}
