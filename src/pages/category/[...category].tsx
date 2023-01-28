import { type NextPage } from "next";
import React, { useState, useContext } from "react";
import { useRouter } from 'next/router'

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import ModBrowser from '../../components/modbrowser';

import { trpc } from "../../utils/trpc";

import { CfgCtx } from "../../components/main";

const Home: NextPage = () => {
    // Retrieve config and CDN.
    const cfg = useContext(CfgCtx);

    let cdn = "";

    if (cfg && cfg.cdn)
        cdn = cfg.cdn;

    const [error, setError] = useState<JSX.Element | null>(null);
    const notFound = <div><h1 className="text-center text-white text-lg font-bold">Not Found</h1><p className="text-center text-white">Category or game within URL not found.</p></div>;

    const { query } = useRouter();

    const category = (query.category != null) ? query.category[0] : null;
    const category2 = (query.category != null && query.category[1] != null) ? query.category[1] : null; 

    const categoryParQuery = trpc.category.getCategory.useQuery({
        id: null,
        url: (category2) ? category ?? null : null,
        parent: 0
    });

    const parentId: number | null = (categoryParQuery.data) ? categoryParQuery.data.id : null;

    const categoryQuery = trpc.category.getCategory.useQuery({
        id: null,
        url: (category2) ? category2 : category ?? null,
        parent: parentId
    });

    const cat = categoryQuery.data;
    const cat2 = categoryParQuery.data;

    let bgFile: string | null = null;

    if (cat != null && cat.hasBg && cat.parent != null)
        bgFile = cat.parent.url + "_" + cat.url + ".png";
    else if (cat != null && cat.hasBg && cat.parent == null)
        bgFile = cat.url + ".png";
    else if (cat != null && cat.parent != null && cat.parent.hasBg)
        bgFile = cat.parent.url + ".png";

    const bgPath = cdn + "/images/backgrounds/" + bgFile;

    const categories: Array<number> = [];

    if (category != null) {
        if (cat) {
            categories.push(cat.id);

            if (error)
                setError(null);
        } else {
            if (!error)
                setError(notFound);
        }

        if (cat && !cat2 && cat.children ) {
            cat.children.map((child) => {
                categories.push(child.id);
            });
        }
    } else if (!error)
        setError(notFound);

    const content = (error == null) ?
        <div>
            <div className="w-full sm:w-4/5 mx-auto m-4">
                <h1 className="text-white text-3xl font-bold">
                    {cat2 == null && cat != null && cat.parent != null ? (
                        <>
                            {cat.parent.name} {"→"} {cat.name + " "}
                        </>
                    ) : (
                        <>
                            {cat != null && cat.name + " "}
                        </>
                    )}
                    Mods
                </h1>
            </div>
            <ModBrowser categories={categories} />
        </div>
        
        : error;

    return (
        <>
            <HeadInfo />
            {bgFile != null ? (
                <BestModsPage
                    content={content}
                    image={bgPath}
                />
            ) : (
                <BestModsPage
                    content={content}
                />  
            )}
        </>
    );
};


export default Home;
