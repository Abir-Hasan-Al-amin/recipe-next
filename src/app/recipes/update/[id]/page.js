"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "@/app/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import ingredients from "../../../../../ingredients.json";
import { storage } from "@/app/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
export default function Recipe({ params }) {
  const [title, setTitle] = useState("");
  const [checkedValues, setCheckedValues] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [user, loading] = useAuthState(auth);
  const [recipe, setRecipe] = useState(null);
  const { id } = params;
  const router = useRouter();
  // default image link
  const dImg =
    "https://firebasestorage.googleapis.com/v0/b/recipeapp-nextjs-assigentment.appspot.com/o/users%2Fdefault%2Fhd-recipes-mobile-image-750x352px.webp?alt=media&token=f6caccc2-2c7a-47e5-8efe-887f8bedd2f9";
  // CheckBox data store
    const handleBox = (e, ingredientVal) => {
    const { checked } = e.target;
    if (checked) {
      setCheckedValues((prev) => [...prev, ingredientVal]);
    } else {
      setCheckedValues((prev) => prev.filter((id) => id !== ingredientVal));
    }
  };
   // Checking if the user is logged in or not
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, router]);
  // update values in firestore and storage and values checking
  const handleUpdate = async () => {
    if (user && recipe) {
      if (title === "" || checkedValues.length === 0 || instructions === "") {
        alert("Missing Info");
        console.log(title, checkedValues, instructions);
        return;
      }
      try {
        let downloadURL = "";
        if (file) {
          const fileRef = ref(
            storage,
            `users/${user.uid}/recipes/${recipe.code}`
          );
          await uploadBytes(fileRef, file);
          downloadURL = await getDownloadURL(fileRef);
        }
        const recipeDocRef = doc(db, `users/${user.uid}/recipes`, id);
        if (file && recipe.imageUrl === dImg) {
          await updateDoc(recipeDocRef, {
            title: title,
            instructions: instructions,
            ingredients: checkedValues,
            imageUrl: downloadURL,
          });
        }
        await updateDoc(recipeDocRef, {
          title: title,
          instructions: instructions,
          ingredients: checkedValues,
        });
        alert("Recipe updated successfully!");
        router.push("/");
      } catch (error) {
        console.error("Error updating recipe:", error);
      }
    }
  };
  // Recipe data fetching from firestore
  useEffect(() => {
    const fetchRecipeData = async () => {
      if (user) {
        try {
          const recipeDocRef = doc(db, `users/${user.uid}/recipes`, id);
          const recipeDocSnapshot = await getDoc(recipeDocRef);
          const recipeData = recipeDocSnapshot.data();
          if (recipeData) {
            setRecipe({
              id: recipeDocSnapshot.id,
              ...recipeData,
            });
            setTitle(recipeData.title);
            setInstructions(recipeData.instructions);
            setCheckedValues(recipeData.ingredients);
          } else {
            console.error(`Recipe with ID ${id} not found.`);
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
        }
      }
    };
    fetchRecipeData();
  }, [id, user]);
  return (
    <div className="flex pt-10 flex-col items-center bg-[#161925] text-[#FDFFFC] min-h-screen">
      <div className="py-6 text-3xl font-bold">Update Recipe</div>
      {recipe ? (
        <div className="w-11/12  md:w-8/12">
          <div className="py-4 flex flex-col gap-3">
            <label htmlFor="title" className=" font-bold text-xl">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#373F51] p-2 rounded-md outline-none h-14"
            />
          </div>
          <div className="flex justify-center py-4">
            {recipe.imageUrl && (
              <img
                src={recipe.imageUrl}
                className=" w-full md:w-5/12 rounded-md shadow-lg"
                alt="Recipe"
              />
            )}
          </div>
          <div className="py-4">
            <h1 className=" font-bold text-xl pb-2">List of Ingredients</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id}>
                  <input
                    type="checkbox"
                    value={ingredient.label}
                    checked={checkedValues.includes(ingredient.label)}
                    onChange={(e) => handleBox(e, ingredient.label)}
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
              className=" h-40 bg-[#373F51] p-2 outline-none rounded-md"
              onChange={(e) => setInstructions(e.target.value)}
            />
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
              onClick={handleUpdate}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
