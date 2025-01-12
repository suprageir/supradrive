"use client";

import { menu, type Item } from '#/lib/menu';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { GlobalNav } from "#/ui/global-nav";
import { AddressBar } from "#/ui/address-bar";
import Byline from '#/ui/byline';

const APIURL = process.env.NEXT_PUBLIC_APIURL;

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("supradrivetoken") || "";
    const checkToken = async () => {
      axios.get(APIURL + "/supradrive/auth/token", { withCredentials: true, headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
        .then((response: any) => {
          setLoading(false);
        })
        .catch((e: Error) => {
          redirect('/login');
        });
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl font-medium text-gray-300">Checking authentication...</h1>
      </div>
    );
  }

  return (

    <>
      <GlobalNav />

      <div className="lg:pl-72">
        <div className="mx-auto space-y-8 px-2 pt-20 lg:px-8 lg:py-8">
          <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
            <div className="rounded-lg bg-black">
              <AddressBar />
            </div>
          </div>

          <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
            <div className="rounded-lg bg-black p-3.5 lg:p-6 w-full">


              <h1 className="text-xl font-medium text-gray-300">SupraDrive</h1>

              <div className="space-y-10 text-white">
                {menu.map((section) => {
                  return (
                    <div key={section.name} className="space-y-5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {section.name}
                      </div>

                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {section.items.map((item) => {
                          return (
                            <Link
                              href={`/${item.slug}`}
                              key={item.name}
                              className="group block space-y-1.5 rounded-lg bg-gray-900 px-5 py-3 hover:bg-gray-800"
                            >
                              <div className="font-medium text-gray-200 group-hover:text-gray-50">
                                {item.name}
                              </div>

                              {item.description ? (
                                <div className="line-clamp-3 text-sm text-gray-400 group-hover:text-gray-300">
                                  {item.description}
                                </div>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>

          <Byline />

        </div>
      </div>


    </>
  );
}

