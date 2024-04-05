// src/components/Newsletter.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type Inputs = z.infer<typeof schema>;

const Newsletter = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Inputs) => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const resData = await res.json();

      toast.success(resData.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg shadow-md"
      >
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          disabled={loading}
          className="p-2 border border-gray-300 rounded-md w-64"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
      <Toaster />
    </div>
  );
};

export default Newsletter;
