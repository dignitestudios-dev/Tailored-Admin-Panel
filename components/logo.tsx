import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  color?: string;
}

export function Logo({
  size = 24,
  className,
  src = "/images/logo.png",
  alt = "Tailored logo",
  priority = false,
  color,
}: LogoProps) {
  void color;

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
