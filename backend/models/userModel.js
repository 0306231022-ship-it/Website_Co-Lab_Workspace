import {execute} from '../config/db.js';

export default class userModel{
    static async all(includeDeleted = false){
        try{
            const [rows] = includeDeleted
            ? await execute('SELECT * FROM users')
            : await execute('SELECT * FROM users WHERE deleted_at IS NULL')
            return rows ?? null;
        }catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async findId(id, includeDeleted = false){
         try{
            const [rows] = includeDeleted
            ? await execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
            : await execute('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id])
            return rows[0] ?? null;
        }catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async findUserName(username, includeDeleted = false){
        try {
            const [rows] = includeDeleted 
            ? await execute('SELECT * FROM users WHERE username = ? LIMIT 1',[username])
            : await execute('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL LIMIT 1',[username])
            return  rows[0] ?? null;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }

    static async create({
        username, hashedPassword, name = '', email = '', address = '', phone = '', is_admin = false
    }){
        try {
            const [result] = await execute(
                'INSERT INTO users(username, password, name, email, address, phone, is_admin) VALUES(?,?,?,?,?,?,?)',
                [username, hashedPassword, name, email, address, phone, is_admin?1:0]

            ) ;
            return result.affectedRows > 0 ? result.insertId : null;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        
        }
    }

    static async removeToken(token, expiresAt){
        try {
            const [result] = await execute('INSERT INTO revoked_tokens(token, expires_at) VALUES(?, ?)',[token, expiresAt])
            return result.affectedRows > 0;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }

    static async isTokenRevoked(token){
        try {
            const [rows] = await execute('SELECT id FROM revoked_tokens WHERE token = ? LIMIT 1', [token])
            return rows.length > 0;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }
}