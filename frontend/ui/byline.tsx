import { VercelLogo } from '#/ui/vercel-logo';

export default function Byline() {
  return (
    <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
      <div className="flex flex-col justify-between space-y-2 rounded-lg bg-black p-3.5 lg:px-5 lg:py-3">
        <div className="flex items-center gap-x-1.5">
          <div className="text-sm text-gray-400">By</div>
          <a href="https://suprageir.no" title="SupraGeir">
            <div className="w-16 text-gray-100 hover:text-gray-50">
              SupraGeir
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
