"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/app/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
export default function Recipe({ params }) {
  const [user, loading] = useAuthState(auth);
  const [recipe, setRecipe] = useState(null);
  const { id } = params;
  const router = useRouter();
  // Checking if the user is logged in or not
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, router]);
  // data fetching from firestore
  useEffect(() => {
    const fetchRecipeData = async () => {
      if (user) {
        try {
          const recipeDocRef = doc(db, `users/${user.uid}/recipes`, id);
          const recipeDocSnapshot = await getDoc(recipeDocRef);
          setRecipe({
            id: recipeDocSnapshot.id,
            ...recipeDocSnapshot.data(),
          });
        } catch (error) {
          console.error("Error fetching recipe:", error);
        }
      }
    };
    fetchRecipeData();
  }, [id, user]);

  return (
    <div className=" flex pt-10 flex-col items-center bg-[#161925] text-[#FDFFFC] min-h-screen">
      <div className="py-4 text-3xl font-bold">Recipe of</div>
      {recipe ? (
        <div className=" w-11/12 md:w-10/12">
          <h1 className=" text-4xl font-bold text-center p-4">
            {recipe.title}
          </h1>
          <div className="flex justify-center py-4">
            <img
              src={recipe.imageUrl}
              className=" w-full md:w-5/12 rounded-md shadow-lg"
              alt="Recipe"
            />
          </div>
          <div className="py-4">
            <h1 className=" font-bold text-xl pb-2">List of Ingredients :</h1>
            <h1>{recipe.ingredients && recipe.ingredients.join(", ")}</h1>
          </div>
          <div>
            <h1 className=" font-bold text-xl pb-2">Instructions :</h1>
            <h1>{recipe.instructions}</h1>
          </div>
          <div className="py-10 flex justify-center">
            <button
              className=" bg-[#68B684] w-28 h-12 rounded-md"
              onClick={() => router.push(`/recipes/update/${id}`)}
            >
              Update
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
