import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { jwtConstants } from './constants';
import { signinDto, signupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}    

    async signup(dto: signupDto, req : Request, res: Response) {
        const { name , email, password } = dto;
        const isCurrentUser = await this.prisma.user.findUnique({ where: { email: email}});        
        if (isCurrentUser) throw new BadRequestException('Email already exists');
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.user.create({
            data: {
                name: name,
                email: email,
                hashedPassword: hashedPassword,

            }
        })
        const user = await this.prisma.user.findUnique({where: {email: email}});
        if (!user) throw new BadRequestException('Could Not Create User')
        const payload = { sub: user.id, username: user.name}
        const token = await this.jwtService.signAsync(payload, { secret: jwtConstants.secret, expiresIn: '1h' },)

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });
        return res.send({message: 'Success'})
    }

    async signin (dto: signinDto, req : Request, res: Response) {
        const { email, password } = dto;
        const user = await this.prisma.user.findUnique({where: {email: email}})
        if (!user) throw new BadRequestException(`No user with the email ${email}`)
        const isMatch = await bcrypt.compare(password, user.hashedPassword)
        if (!isMatch) throw new BadRequestException('Invalid Login Credentials')
        const payload = { sub: user.id, username: user.name}
        const token = await this.jwtService.signAsync(payload, { secret: jwtConstants.secret,  expiresIn: '1h' })
        if (!token) throw new BadRequestException('Internal Server Error');
        res.cookie('token', token,  {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });
        return res.send({message: 'Success'})
    }

    async signout (req : Request, res: Response) {
        res.clearCookie('token')
        return res.send({message: 'Success'})
    }
}