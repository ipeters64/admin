import React from "react";

const certificatesRoutes = [
    {
        path: "/certificates",
        exact: true,
        component: React.lazy(() => import("./Certificates")),
    },
    {
        path: "/certificates/new",
        exact: true,
        component: React.lazy(() => import("./NewCertificate")),
    },
];

export default certificatesRoutes;