import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/files/files.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';

@Module({
  imports: [FilesModule, CollaborationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
