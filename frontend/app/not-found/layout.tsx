import { ClickCounter } from '#/ui/click-counter';
import { TabGroup } from '#/ui/tab-group';
import React from 'react';

const title = 'Not Found';

export const metadata = {
  title,
  openGraph: {
    title,
    images: [`/api/og?title=${title}`],
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="space-y-9">
      <div className="flex justify-between">
        <TabGroup
          path="/not-found"
          items={[
            {
              text: 'Home',
            },

            {
              text: 'Category That Does Not Exist',
              slug: 'does-not-exist',
            },
          ]}
        />

        <div className="self-start">
          <ClickCounter />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
