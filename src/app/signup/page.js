"use client";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import Link from "next/link";
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
export default function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  console.log(auth?.currentUser?.email);
  const register = () => {
    if (password === conPassword) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          var user = userCredential.user;
          console.log("User registered:", user);
        })
        .then(() => {
          return signOut(auth);
        })
        .then(() => {
          setEmail("");
          setPassword("");
          setConPassword("");
          alert("Register Completed");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (error.code === "auth/email-already-in-use") {
            alert("User already exists");
          } else {
            console.error("Error adding document: ", errorCode, errorMessage);
          }
        });
    } else {
      alert("password Doesn't match or Name is Empty");
    }
  };
  return (
    <div className=" bg-[#161925] flex justify-center min-h-screen items-center text-[#FDFFFC]">
      <div className=" bg-[#273043]  w-80 xl:w-[500px]  rounded-md shadow-md h-max">
        <div className="flex flex-col justify-center items-center gap-6">
          <h1 className=" text-4xl font-bold my-10">Recipe App</h1>
          <input
            placeholder="Email"
            type="text"
            className="bg-[#373F51] outline-none w-60 xl:w-80 h rounded-md p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-[#373F51] outline-none h-10 w-60 xl:w-80 rounded-md px-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            placeholder="Confirm Password"
            type="password"
            className="bg-[#373F51] outline-none h-10 w-60 xl:w-80 rounded-md px-2"
            value={conPassword}
            onChange={(e) => setConPassword(e.target.value)}
          />
          <button
            className=" bg-[#20A4F3]   h-11  w-60 xl:w-80 rounded-2xl shadow-md font-medium"
            onClick={register}
          >
            Sign Up
          </button>
          <p className=" text-sm mb-8">
            Already have an account?{" "}
            <Link href={"/signin"} className="text-[#68B684]  font-bold">
              Signin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

