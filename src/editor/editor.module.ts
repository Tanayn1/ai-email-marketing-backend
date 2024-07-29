import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [AwsModule],
  providers: [EditorService],
  controllers: [EditorController]
})
export class EditorModule {}
