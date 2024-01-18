"use client";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth, storage } from "./firebaseConfig";
import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { getDocs, collection, doc, deleteDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { FaTrash } from "react-icons/fa6";
import { TbListDetails } from "react-icons/tb";
export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log("signout");
        router.push("/signin");
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleDeleteRecipe = async (recipeId, recipeCode, recipeImg) => {
    const recipeDocRef = doc(db, `users/${user.uid}/recipes`, recipeId);
    await deleteDoc(recipeDocRef);
    if (
      recipeImg !==
      "https://firebasestorage.googleapis.com/v0/b/recipeapp-nextjs-assigentment.appspot.com/o/users%2Fdefault%2Fhd-recipes-mobile-image-750x352px.webp?alt=media&token=f6caccc2-2c7a-47e5-8efe-887f8bedd2f9"
    ) {
      const storageRef = ref(
        storage,
        `users/${user.uid}/recipes/${recipeCode}`
      );
      await deleteObject(storageRef);
    }
    const updatedRecipes = filteredRecipes.filter(
      (recipe) => recipe.id !== recipeId
    );
    setFilteredRecipes(updatedRecipes);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
      return;
    } else if (!loading) {
      const getRecipesList = async () => {
        try {
          const userRecipesCollection = collection(
            db,
            `users/${user.uid}/recipes`
          );
          const data = await getDocs(userRecipesCollection);
          const filterData = data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setRecipes(filterData);
          setFilteredRecipes(filterData);
        } catch (error) {
          console.error(error);
        }
      };
      getRecipesList();
    }
  }, [user, loading, router]);

  useEffect(() => {
    const filtered = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className=" flex flex-col items-center min-h-screen bg-[#161925] p-9  text-[#FDFFFC]">
      <div className="flex justify-around  items-center pt-6 pb-10">
        <div className="text-4xl font-bold">Recipes App</div>
      </div>
      <div className="flex justify-around items-center w-full">
        <div className=" flex justify-center items-end p-3">
          <button
            onClick={logout}
            className="bg-[#C3423F] h-12 w-28 rounded-md shadow-md font-medium"
          >
            Logout
          </button>
        </div>
        <div className=" flex justify-center items-center p-3">
          <button
            className="bg-[#68B684] h-12 w-28 rounded-md shadow-md font-medium"
            onClick={() => router.push("/recipes/create")}
          >
            Add Recipe
          </button>
        </div>
      </div>
      <div className=" flex flex-col gap-4 w-full md:w-10/12">
        <h1 className="text-3xl text-center font-bold py-6">
          Lists of Recipes
        </h1>
        <div>
          <input
            type="text"
            placeholder="Search by title or ingredient"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=" p-2 rounded-md w-full h-14 font-medium bg-[#373F51]"
          />
        </div>
        <div className="flex gap-5 flex-wrap pt-4">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex justify-between w-full p-3 bg-[#273043] items-center rounded-md"
            >
              <div> {recipe.title}</div>
              <div className="flex gap-2">
                <button
                  className="bg-[#68B684] h-10 w-10 md:w-20  rounded-md shadow-md flex justify-center items-center"
                  onClick={() => router.push(`/recipes/show/${recipe.id}`)}
                >
                  <TbListDetails size={20}/>
                </button>
                <button
                  onClick={() =>
                    handleDeleteRecipe(recipe.id, recipe.code, recipe.imageUrl)
                  }
                  className="bg-[#C3423F] h-10 w-10 md:w-20 rounded-md shadow-md flex justify-center items-center"
                >
                  <FaTrash/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
