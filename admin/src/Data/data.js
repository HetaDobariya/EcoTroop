import {
    UilEstate,
    UilClipboardAlt,
    UilUsersAlt,
    UilEnvelope,
    UilCommentAlt,
    UilDocumentLayoutLeft
}from "@iconscout/react-unicons";

export const SidebarData = [
    {
        icon : UilEstate,
        heading: "Dashboard",
        link: "/mainDash",  
    },

    {
        icon : UilClipboardAlt,
        heading: "orders",
        link: "/accepted_order",  
    },

    {
        icon : UilUsersAlt,
        heading: "Customer",
        link:"/userdetail",  
    },

    {
        icon : UilCommentAlt,
        heading: "Feedback",
        link:  "/feedback",
    },

    {
        icon : UilEnvelope,
        heading: "Contact",
        link: "/contact",  
    },

    {
        icon : UilDocumentLayoutLeft,
        heading: "Blogs",
        link: "/blogs",  
    },
];

export const CardsData = [
    {
        title: 'Accepted',
        color: {
            backGround: "linear-gradient(135deg, #14532d, #166534)", // deep forest to rich green
      boxShadow: "0px 10px 20px 0px rgba(20, 83, 45, 0.5)",
        },
    },

    {
        title: 'E-Waste',
        color: {
            backGround: "linear-gradient(135deg, #064e3b, #047857)", // dark teal green to emerald
      boxShadow: "0px 10px 20px 0px rgba(6, 78, 59, 0.5)",
        },
    },


    {
        title: 'Expenses',
        color: {
            backGround: "linear-gradient(135deg, #0f172a, #166534)", // navy to deep green
      boxShadow: "0px 10px 20px 0px rgba(15, 23, 42, 0.4)"
        },
    },
]
