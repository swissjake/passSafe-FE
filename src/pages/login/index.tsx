/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
// import Headset from "@/assets/icons/headset.svg?react";
import { useNavigate } from "react-router-dom";
import Logo from "@/shared/components/logo";
import Header from "@/shared/components/typography/Header";
import Text from "@/shared/components/typography";
import { Button } from "@/shared/components/button";
import { useFormik } from "formik";
import {
  createValidationSchema,
  schemaValidation,
} from "@/helpers/validation-schemas";
import AuthLayout from "@/shared/layouts/auth-layout";
import useLoginMutation from "@/api/auth/login";
import { useContext } from "react";
import { GlobalContext } from "@/context/globalContext";
import apiMessageHelper from "@/helpers/apiMessageHelper";
import { decryptUserData } from "@/utils/EncryptDecrypt";
import { deriveKey } from "@/utils/keyUtils";
import { importKeyFromBase64 } from "@/utils/generateKey";
import { hashPassword } from "@/utils/hashPassword";
import axiosInstance from "@/config/axios";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, setEncryptionKey, setPassword } =
    useContext(GlobalContext);
  const { emailValidation, passwordValidation } = schemaValidation;
  const { mutateAsync, isPending } = useLoginMutation();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: createValidationSchema({
      email: emailValidation({
        errorMessage: "Enter your email",
      }),
      password: passwordValidation({
        errorMessage: "Enter your password",
      }),
    }),
    onSubmit: async (values) => {
      try {
        const saltResponse = await axiosInstance(
          `/get-salt?email=${encodeURIComponent(values.email)}`
        );
        const hashedPassword = await hashPassword(
          values.password,
          saltResponse?.data?.salt
        );

        const response = await mutateAsync({
          password: hashedPassword,
          email: values.email,
        });

        const { success, accessToken, message, expiresIn } = response;

        apiMessageHelper({
          success,
          message: message ?? "Login Successful",
          onSuccessCallback: async () => {
            if (response.is2StepEnabled) {
              setPassword && setPassword(values.password);
              navigate(`/enter-otp?email=${values.email}`);
            } else {
              handleLogin && handleLogin(accessToken);
              sessionStorage.setItem("accessToken", accessToken);
              const adjustedExpiresIn = expiresIn - 60;
              sessionStorage.setItem("expiresIn", adjustedExpiresIn.toString());

              //decryption taking place here
              const encryptionSalt = response?.salt;
              const mk = response?.mk;
              const ivBase64 = response?.iv;
              const sek = await deriveKey(values.password, encryptionSalt);

              try {
                const decryptedSek = await decryptUserData(mk, ivBase64, sek);
                const importMk = await importKeyFromBase64(decryptedSek);
                setEncryptionKey && setEncryptionKey(importMk);
              } catch (error) {
                console.error("Decryption of sek failed:", error);
              }
            }
          },
        });
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    },
  });

  return (
    <AuthLayout>
      <form onSubmit={formik.handleSubmit}>
        <div className="w-full md:w-[423px]">
          <Logo />
          <div className=" text-center">
            <Header size="xl" weight="medium" variant="primary-100">
              Log into your account
            </Header>
            <Text size="lg" variant="primary" className="leading-[28px] ">
              Seamlessly access your account and take ful control of your
              experience
            </Text>
          </div>
          <div className="flex flex-col gap-y-[16px] mt-[32px] ">
            <div>
              <Input
                label="Email address"
                type="email"
                placeholder="Enter Email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                formikOnBlur={formik.handleBlur}
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : ""
                }
                icon={formik.touched.email && !formik.errors.email}
              />
            </div>

            <div>
              <Input
                label="Master Password"
                type="password"
                id="password"
                placeholder="Enter Master Password"
                onChange={formik.handleChange}
                value={formik.values.password}
                formikOnBlur={formik.handleBlur}
                error={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : ""
                }
              />
              {/* <Link
                to={"/forgot-password"}
                className="text-secondary-200 text-sm font-medium mt-2"
              >
                Forgot Password ?
              </Link> */}
            </div>

            <Button isPending={isPending} className="mt-6" variant="primary">
              Log in
            </Button>

            <div className="flex justify-center gap-2 text-base my-6">
              <span className="text-grey-100">Don't have an account? </span>
              <span
                onClick={() => navigate("/create-account")}
                className="font-semibold cursor-pointer"
              >
                Create account
              </span>
            </div>

            {/* <Button
              className="flex items-center justify-center gap-2"
              variant="tertiary"
            >
              <Headset />
              Contact Support
            </Button> */}
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
