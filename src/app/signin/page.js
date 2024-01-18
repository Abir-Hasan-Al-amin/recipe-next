"use client"; 
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import React, { useState } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  console.log(auth?.currentUser?.email);

  const logIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        router.push('/');
      })
      .catch((error) => {
        if (error.code === "auth/invalid-credential") {
          alert("User not found. Please check your email and Password.");
        } else {
          console.error(error.message);
        }
      });
  };

  const googleLogIn = () => {
    signInWithPopup(auth, googleProvider)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        router.push('/');
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return (
    <div className=" bg-[#161925] flex justify-center min-h-screen items-center text-[#FDFFFC]">
      <div className=" bg-[#273043]  w-80 xl:w-[500px]  rounded-md shadow-md max-h-max">
        <div className="flex flex-col justify-center items-center gap-6">
          <h1 className=" text-4xl font-bold my-10">Recipe App</h1>
          <input
            type="text"
            placeholder="Email"
            className=" outline-none h-10 w-60 xl:w-80 rounded-md px-2 bg-[#373F51]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            className=" outline-none h-10 w-60 xl:w-80 rounded-md px-2 bg-[#373F51]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={logIn}
            className="bg-[#20A4F3]  h-12  w-60 xl:w-80 rounded-2xl shadow-md font-medium flex gap-2 justify-center items-center"
          >
            Sign In
          </button>
          <p className="font-bold">or</p>
          <button
            onClick={googleLogIn}
            className="  bg-[#648DE5]  h-12  w-60 xl:w-80 rounded-2xl shadow-md font-medium flex gap-2 justify-center items-center"
          >
            Sign In with Google
          </button>
          <p className=" text-sm mb-8">
            Don't have an account?{" "}
            <Link href={"/signup"} className=" text-[#68B684] font-bold">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
