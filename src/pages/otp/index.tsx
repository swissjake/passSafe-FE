import useResendOtpMutation from "@/api/auth/resend-otp";
import useVerifyOtpMutation from "@/api/email-verification/verify-login-otp";
import { GlobalContext } from "@/context/globalContext";
import apiMessageHelper from "@/helpers/apiMessageHelper";
import { useCountdown } from "@/hooks/useCountdown";
import useOtpValidation from "@/hooks/useOtpValidation";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/button";
import Logo from "@/shared/components/logo";
import Otp from "@/shared/components/otp-input";
import Text from "@/shared/components/typography";
import Header from "@/shared/components/typography/Header";
import AuthLayout from "@/shared/layouts/auth-layout";
import { decryptUserData } from "@/utils/EncryptDecrypt";
import { importKeyFromBase64 } from "@/utils/generateKey";
import { deriveKey } from "@/utils/keyUtils";
import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EnterOtp = () => {
  const { otp, setOtp, error, setError } = useOtpValidation();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useVerifyOtpMutation();
  const { mutateAsync: resendOtp } = useResendOtpMutation();

  const [searchParams] = useSearchParams();
  const { handleLogin, setEncryptionKey, password } = useContext(GlobalContext);
  const { isResendDisabled, formatCountdown, startCountdown, countdown } =
    useCountdown();

  useEffect(() => {
    if (!password || !email) return navigate("/login");
  }, [password]);

  const newSearchParams = new URLSearchParams(searchParams);
  const email = newSearchParams.get("email");

  useEffect(() => {
    email && startCountdown();
  }, []);

  const handleResendOtp = async () => {
    const response = await resendOtp({ email });
    const { success, message } = response;
    apiMessageHelper({
      message,
      success,
      onSuccessCallback() {
        !isResendDisabled && startCountdown();
      },
    });
  };

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      setError("OTP must be 6 digits long");
    } else {
      const response = await mutateAsync({
        verificationCode: otp,
        email,
      });

      const { message, success, accessToken, expiresIn } = response;
      apiMessageHelper({
        message,
        success,
        onSuccessCallback: async () => {
          handleLogin && handleLogin(accessToken);
          sessionStorage.setItem("accessToken", accessToken);
          const adjustedExpiresIn = expiresIn - 60;
          sessionStorage.setItem("expiresIn", adjustedExpiresIn.toString());

          //decryption taking place here
          const encryptionSalt = response?.salt;
          const mk = response?.mk;
          const ivBase64 = response?.iv;

          const sgek = await deriveKey(password, encryptionSalt);
          try {
            const decryptedSGEK = await decryptUserData(mk, ivBase64, sgek);
            const importMk = await importKeyFromBase64(decryptedSGEK);
            setEncryptionKey && setEncryptionKey(importMk);
          } catch (error) {
            console.error("Decryption of SGEK failed:", error);
          }
        },
      });
    }
  };

  return (
    <AuthLayout>
      <div className="w-full md:w-[538px] text-center">
        <Logo />
        <Header size="xl" variant="primary-100" weight="medium">
          Enter OTP
        </Header>
        <Text size="lg" variant="primary" className=" mt-2 lg:mt-4">
          To ensure the security of your account,We sent a six-digit pin to your
          email address
        </Text>
        <Text size="lg" variant="primary-50" weight="semibold" className="mt-3">
          {email}
        </Text>

        <Otp otp={otp} setOtp={setOtp} error={error} />

        <Button
          isPending={isPending}
          onClick={handleSubmit}
          type="button"
          size="md"
          variant="primary"
          className="mt-6 md:!w-[202px] mx-auto"
        >
          Submit
        </Button>

        <div className="flex justify-center gap-2 text-base mt-4">
          <span className="text-grey-100">Didn't get the link? </span>
          <button
            disabled={isResendDisabled}
            onClick={handleResendOtp}
            className={cn(
              "font-semibold cursor-pointer ",
              isResendDisabled && "text-[#CCD2D9]"
            )}
          >
            Resend
          </button>
        </div>
        {isResendDisabled && countdown !== null && countdown > 0 && (
          <div className="text-center my-4">
            <span className="text-success-100 text-base">
              {formatCountdown()}
            </span>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default EnterOtp;
