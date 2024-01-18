"use client";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import ingredients from "../../../../ingredients.json";
import { db, storage } from "@/app/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [checkValue, setCheckValue] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleBox = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCheckValue((prev) => [...prev, value]);
    } else {
      setCheckValue((prev) => prev.filter((un) => un !== value));
    }
  };
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, router]);
  const handleCreateRecipe = async () => {
    if (title === "" || checkValue.length === 0 || instructions === "") {
      alert("Missing Info");
      return;
    }
    const recipeId = uuidv4();
    const userRecipesRef = collection(db, `users/${user.uid}/recipes`);
    try {
      if (!file) {
        await addDoc(userRecipesRef, {
          code: recipeId,
          title: title,
          ingredients: checkValue,
          instructions: instructions,
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/recipeapp-nextjs-assigentment.appspot.com/o/users%2Fdefault%2Fhd-recipes-mobile-image-750x352px.webp?alt=media&token=f6caccc2-2c7a-47e5-8efe-887f8bedd2f9",
        });
      } else {
        const storageRef = ref(
          storage,
          `users/${user.uid}/recipes/${recipeId}`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(userRecipesRef, {
          code: recipeId,
          title: title,
          ingredients: checkValue,
          instructions: instructions,
          imageUrl: downloadURL,
        });
      }
      alert("Successfully added");
      router.push("/");
    } catch (error) {
      console.error("Error adding recipe:", error.message);
    }
  };
  return (
    <div className=" flex pt-10 flex-col items-center bg-[#161925] text-[#FDFFFC] min-h-screen">
      <div className="py-4 text-3xl font-bold">Create New Recipe</div>
      <div className="w-11/12">
        <div className="py-4 flex flex-col gap-3">
          <label htmlFor="title" className=" font-bold text-xl">
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            className="bg-[#373F51] p-2 rounded-md outline-none"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="py-4">
          <h1 className=" font-bold text-xl pb-2">List of Ingredients</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id}>
                <input
                  type="checkbox"
                  value={ingredient.label}
                  onChange={handleBox}
                  className="mr-1"
                />
                <span>{ingredient.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 py-4">
          <label htmlFor="ins" className=" font-bold text-xl">
            Instructions:
          </label>
          <textarea
            id="ins"
            value={instructions}
            className=" h-40 bg-[#373F51] p-2 rounded-md outline-none"
            onChange={(e) => setInstructions(e.target.value)}
          ></textarea>
        </div>
        <div className="py-4">
          <label htmlFor="file" className=" font-bold text-xl">
            Upload Image/Video:{" "}
          </label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="py-10 flex justify-center">
          <button
            className=" bg-[#68B684] w-28 h-12 rounded-md"
            onClick={handleCreateRecipe}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
