import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(){
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({token,req}) => {
                const {pathname} = req.nextUrl;
                //allow auth related routes
                if(
                    pathname.startsWith("/api/auth")||
                    pathname === "/sign-in" ||
                    pathname === "/sign-up" ||
                    pathname === "/"
                ){
                    return true;
                }

                // Protect /Book route - only authenticated users
                if(pathname.startsWith("/Book")){
                    return !!token;
                }

                return !!token;
            }
        }
    }
)