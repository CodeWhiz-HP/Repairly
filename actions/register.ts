"use server"
import dbConnect from "@/lib/dbConnect";
import { registerSchema, FormState } from "@/lib/definitions"
import User from "@/lib/models/User";
import bcrypt from "bcryptjs"

export async function register(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    businessName: formData.get("businessName") || undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Connect to database
  await dbConnect();

  // Check if user already exists
  const existingUser = await User.findOne({ email: validatedFields.data.email });
  if (existingUser) {
    return {
      success: false,
      errors: {
        email: ["Email already registered"],
      },
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

  // Create user object
  const userData = {
    name: validatedFields.data.name,
    role: validatedFields.data.role,
    email: validatedFields.data.email,
    password: hashedPassword,
    businessName: validatedFields.data.role === 'Technician' 
      ? validatedFields.data.businessName || null 
      : null,
  };

  try {
    // Save to database
    const newUser = await User.create(userData);

    if (!newUser) {
      return {
        success: false,
        errors: {
          email: ["An error occurred while creating your account."],
        },
      };
    }

    return {
      success: true,
      message: "Account created successfully!",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      errors: {
        email: [error.message || "An error occurred during registration"],
      },
    };
  }
}