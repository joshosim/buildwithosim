'use client';

import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import * as yup from "yup";
import Side from "@/components/Side";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Facebook, Github, Instagram, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";

//this is good
const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Email is not well written")
      .required("Email is required"),
    message: yup.string().required("Message is required"),
  })
  .required();

export default function Contact() {

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter()

  const handleClick = () => {
    const message = "Hello, Osim Uka!"
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${+2347066530998}?text=${encodedMessage}`;
    window.location.href = whatsappUrl;
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // await emailjs
      //   .send("service_6r0mb7a", "template_fc19ssa", data, "eP90LBxaVMewj9zZU")
      //   .then(
      //     (result: any) => {
      //       console.log("Email successfully sent:", result.text);
      //     },
      //     (error: any) => {
      //       console.error("Failed to send email:", error.text);
      //     }
      //   );
    },
    onSuccess: (data) => {
      toast.success("Sent email successfully");
      router.push("/");
      console.log(data);
    },
    onError: (error) => {
      toast.error("Failed to send email");
      console.log(error);
    },
  });
  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mt-16 mb-20 grid grid-cols-1 md:grid-cols-[25%_73%] gap-6">
        <Side />
        <div className="mx-0 md:mx-0 px-4 md:px-0">
          <h1 className="font-normal text-3xl md:text-7xl text-left mb-4 text-gray-900 dark:text-white">
            Follow Me
          </h1>
          <div className="flex items-center gap-4 justify-start my-4 flex-wrap">
            <button
              className="text-base md:text-xl rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-light px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => window.open("https://www.facebook.com/uka.osim.56", "_blank")}
            >
              <Facebook size={30} className="text-gray-900 dark:text-gray-100" />
              Facebook
            </button>
            <button
              className="text-base md:text-xl rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-light px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => window.open("https://www.linkedin.com/in/uka-osim-9761601a0/", "_blank")}
            >
              <Linkedin size={30} className="text-gray-900 dark:text-gray-100" />
              LinkedIn
            </button>
            <button
              className="text-base md:text-xl rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-light px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => window.open("https://www.instagram.com/ukaosim/", "_blank")}
            >
              <Instagram size={30} className="text-gray-900 dark:text-gray-100" />
              Instagram
            </button>
            <button
              className="text-base md:text-xl rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-light px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => window.open("https://x.com/teamjojo_code", "_blank")}
            >
              <Twitter size={30} className="text-gray-900 dark:text-gray-100" />
              X (Twitter)
            </button>
            <button
              className="text-base md:text-xl rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-light px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => window.open("https://github.com/joshosim", "_blank")}
            >
              <Github size={30} className="text-gray-900 dark:text-gray-100" />
              Github
            </button>
            <button
              className="text-base md:text-xl rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-light px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={handleClick}
            >
              <MessageCircle size={30} className="text-gray-900 dark:text-gray-100" />
              Whatsapp
            </button>
          </div>
          <h2 className="font-normal text-3xl md:text-4xl text-left mb-4 text-gray-900 dark:text-white">
            Reach out to me.
          </h2>
          <form
            className="bg-white dark:bg-gray-800 rounded-xl p-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      placeholder="Name"
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      placeholder="Email"
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <Controller
              name="message"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="mb-4">
                  <textarea
                    {...field}
                    rows={5}
                    placeholder="Message"
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                  )}
                </div>
              )}
            />
            <button
              type="submit"
              className="w-full bg-black dark:bg-gray-900 text-white rounded-md py-3 text-sm font-normal hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              Send a Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}