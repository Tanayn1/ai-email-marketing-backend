import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto, signinDto } from './dto/auth.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authservice: AuthService) {}

    @Post('signup')
    signup(@Body() dto: signupDto, @Req() req  : Request, @Res() res: Response) {
        return this.authservice.signup(dto, req, res)
    }

    @Post('signin')
    signin(@Body() dto: signinDto, @Req() req  : Request, @Res() res: Response) {
        return this.authservice.signin(dto, req, res)
    }

    @Get('signout')
    signout( @Req() req  : Request, @Res() res: Response) {
        return this.authservice.signout(req, res)
    }
}
