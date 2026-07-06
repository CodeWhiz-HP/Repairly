import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "./models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {label:"Email",type:"text",placeholder: "johndoe@gmail.com"},
                password: {label:"Password",type:"password",placeholder: "*****"},
            },
            authorize: async (credentials) => {
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Missing Email or Password.")
                }

                try {
                    await dbConnect()
                    const user = await User.findOne({email:credentials.email})
                    if(!user){
                        throw new Error("User Not Found.");
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)
                    if(!isPasswordCorrect) throw new Error("Invalid Password.")
                    return {
                       id: user._id.toString(),
                       _id: user._id.toString(),
                       email: user.email,
                       role: user.role,
                       name: user.name,
                       businessName: user.businessName ?? null
                    }
                } catch (error) {
                    throw error
                }
            },
     }),
    ],

    callbacks: {
        async jwt({token,user}){
            if(user){
                token.id = user.id || user._id
                token.role = user.role
                token.businessName = user.businessName ?? null
            }
            return token
        },
        async session({session,token}){
            if(session.user){
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.businessName = token.businessName as string | null
            }
            return session
        }
    },
    pages: {
       signIn: "/sign-in",
       error: "/sign-in"
    },
    session: {
        strategy: "jwt",
        maxAge: 30*24*60*60
    },
    secret: process.env.NEXTAUTH_SECRET
}