import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { HasRole } from "@utils/roles";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";

import { prisma } from "@server/db/client";
import { type Source } from "@prisma/client";
import SourceForm from "@components/forms/source/main";
import NotFound from "@components/errors/notfound";

export default function Page ({
    source
} : {
    source?: Source
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={`Editing Source ${source?.name ?? "N/A"} - Best Mods`}
            />
            <Main>
                <div className="flex flex-col gap-2">
                    {HasRole(session, "ADMIN") ? (
                        <>
                            {source ? (
                                <>
                                    <h1>Editing Source {source.name}</h1>
                                    <SourceForm source={source} />
                                </>
                            ) : (
                                <NotFound item="source" />
                            )}
                        </>
                    ) : (
                        <NoAccess />
                    )}
                </div>
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const url = params?.url?.toString();
    
    let source: Source | null = null;

    const session = await getServerAuthSession(ctx);

    if (HasRole(session, "ADMIN") && url) {
        source = await prisma.source.findFirst({
            where: {
                url: url
            }
        })
    }

    return {
        props: {
            source: source
        }
    }
}