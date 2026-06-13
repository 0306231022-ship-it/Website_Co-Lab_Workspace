import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;

export default class userController{
    static async generateToken(user){
        return jwt.sign(
            {id : user.id},
            JWT_SECRET,
            {expiresIn:JWT_EXPIRES_IN}
        );
    }
    static async login_demo(req, res){
        
        return res.status(200).json({
            success : true,
            username : 'testuser',
            token : 'demo-token'
        });
    }


    static async login(req, res){
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({
                success : false,
                message : 'Username and password require'
            });
        }

        const user = await userModel.findUserName(username);
        if(!user){
            return res.status(401).json({
                success : false,
                message : 'Invalid credentials'
            });
        }

        const isMath =await compare(password, user.password);
        if(!isMath){
            return res.status(401).json({
                success : false,
                message : 'Invalid credentials'
            });
        }

        const token  =await userController.generateToken(user);
        return res.status(200).json({
                success : true,
                username : user.username,
                token : token
            });
    }

    static async  validatePassword(password) {
        const passwordRule ={
            minLength : 8,
            maxLength : 100,
            requiredUpperCase : true,
            requiredLowerCase : true,
            requiredNumber : true,
            requiredSpecial : true
        };

        if(password.length < passwordRule.minLength || password.length > passwordRule.maxLength)
            return false;
        if(passwordRule.requiredUpperCase && !/[A-Z]/.test(password))
            return false;
        if(passwordRule.requiredLowerCase && !/[a-z]/.test(password))
            return false;
         if (passwordRule.requiredNumber && !/[0-9]/.test(password)) 
        return false;
        if (passwordRule.requiredSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return false;
        }
        return true;
    }

    static async register(req, res) {
        const {username, password} = req.body;
        if(!username || !password)
            return res.status(400).json({
                success : false,
                message : 'Username and password require'
        });

        const exstingUser = await userModel.findUserName(username);
        if(exstingUser){
            return res.status(400).json({
                success : false,
                message : 'Username already take'
        });
        }

        if(!await userController.validatePassword(password))
            return res.status(400).json({
                success : false,
                message : 'Password does not meet complexity requiremnet: 8-100 charactor, a least 1 for each: uppercase, lowercase, number, special charator'
        });

        const hashedPassword = await hash(password, PASSWORD_HASH_ROUNDS);
        const newId = await userModel.create({username, hashedPassword});
        if(!newId) return new Error('User create failed');
        res.status(200).json({
            success : true,
            user : {
                id : newId,
                username : username
            }
        });
        
    }

    static async logout(req, res){
        const token = req.token;
        if(!token){
            return res.status(400).json({
                success : false,
                message : 'Not token provider'
        });
        }

        const decode = jwt.decode(token);
        const exp= decode && decode.exp ? new Date(decode.exp*1000):null;
        if(!exp){
            return res.status(400).json({
                success : false,
                message : 'Invalid token'
        });
        }

        const result = await userModel.removeToken(token, exp);
        if(!result){
             return res.status(400).json({
                success : false,
                message : 'Token revocation failed'
        });
        }

        res.status(200).json({
            success : true,
            message : 'Logged out'
        })
    }

    static async profile(req, res) {
        const id = req.userId;
        if(!id){
            return res.status(401).json({
                success : false,
                message : "Unauthourized"
            });
        }
        const user = await userModel.findId(id);
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        res.status(200).json({
            success : true,
            user : {...user, password : ''}
        });
    }
}