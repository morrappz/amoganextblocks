import Link from "next/link";

interface Props {
  title: string;
  description: string;
}

export default function Topbar({ data }: { data: Props }) {
  return (
    <div className="bg-card">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="flex items-center justify-between gap-x-6 p-4">
          <div className="flex w-full items-center gap-x-4 text-sm">
            <p className="flex-1 text-center">
              <Link
                href="#"
                className="font-semibold underline-offset-4 hover:underline"
              >
                {data.title}
              </Link>
              <span className="hidden sm:inline"> — {data.description}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
