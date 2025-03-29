// import { clientAxiosInstance } from "@/api/client.axios";
// import { trainerAxiosInstance } from "@/api/trainer.axios";
// import { adminAxiosInstance } from "@/api/admin.axios";



// export type Category = {
//     _id: string;
//     categoryId: string;
//     status: boolean;
//     title: string;
//     description?:string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//   };
  
//   export interface CategoryResponse {
//     success: boolean;
//     categories: Category[];
//   }


  
// export const addAndEditCategory = async (categoryData: {
//     id?: string;
//     status?: string;
//     name?: string;
//   }) => {
//     if (categoryData.id) {
//       if (categoryData.status) {
//         const response = await adminAxiosInstance.patch(
//           `/admin/categories/${categoryData.id}`
//         );
//         return response.data;
//       } else {
//         const response = await adminAxiosInstance.put(
//           `/admin/categories/${categoryData.id}`,
//           categoryData
//         );
//         console.log(response.data)
//         return response.data;
//       }
//     } else {
//       const response = await adminAxiosInstance.post(
//         "/admin/categories",
//         categoryData
//       );
//       console.log(response.data)
//       return response.data;
      
//     }
//   };
  