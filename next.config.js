/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Real product photography will live in Supabase Storage once it's
      // uploaded — this lets next/image optimize it the moment image_url
      // is set on a product, no config change needed then.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
