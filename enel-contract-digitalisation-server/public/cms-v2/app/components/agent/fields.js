/**
 * type: "text" | "integer" | "password" | "checkbox" | "select" | "textarea" | "date" | "datetime" | "datetime-local"
 * name: String (form name)
 * label: String (form label, error refferer)
 * default: Mixed
 * required: Boolean
 * rule: "unicity" | "phone" | "email"
 * options: Array | String
 * oValue: String (options key as Option value)
 * oLabel: String (options key as Option label)
 * dispatch: String (mapDispatchToProps.key used for dynamic filtering of store),
 * triggingMethod: String,
 * feedingMethod: String
 *
 */

export default [{
    type: "checkbox",
    name: "isActive",
    label: "is active",
    default: false
},
    {},
    {
        type: "text",
        required: true,
        name: "marca",
        label: "Marca",
        rule: "unicity",
    },
    // {
    //     type: "password",
    //     required: true,
    //     name: "password",
    //     label: "Password"
    // },
    {
        type: "text",
        name: "firstName",
        label: "First name",
        required: true,
    },
    {
        type: "text",
        name: "lastName",
        label: "Last name",
        required: true,
    },
    {
        type: "text",
        name: "email",
        label: "email",
        required: true,
        rule: 'email'
    },
    {
        type: "text",
        name: "phone",
        label: "phone number",
        required: true,
        rule: "phone"
    },
    // {
    //     type: "select",
    //     name: "county",
    //     label: "county",
    //     options: "judete",
    //     oValue: "denumire",
    //     oLabel: "denumire",
    //     dispatch: "getLocalitati",
    // },
    {
        type: "text",
        name: "county",
        label: "county"
    },
    {
        type: "text",
        name: "city",
        label: "city"
    },
    {
        type: "text",
        name: "establishmentAddress",
        label: "Estabilishment address"
    },
    {
        type: "text",
        name: "workingRegion",
        label: "working region"
    },
    {
        type: "select",
        name: "role",
        label: "Role",
        options: "fetchWithMethod",
        feedingMethod: "rolesOptions",
        default: "user"
    },
    {
        type: "select",
        name: "type",
        label: "Channels",
        options: [
            {"Partener": "vi"},
            {"Low investment": "li"},
            {"Punct PPC": "pe"},
            {"Info Kiosk": "ik"},
            {"Call Center": "cc"},
        ],
        triggingMethod: "employedOptions",
        default: "vi"
    },
    {
        type: "select",
        name: "employed",
        label: "D2D/Shop",
        options: "fetchFromState",
        optionsState: "employedOptions",
        default: "0"
    },
    {
        type: "select",
        name: "managerMarca",
        label: "manager",
        options: "teamleads",
        oValue: "marca",
        oLabel: ["lastName", "firstName"]
    },
    {
        type: "select",
        name: "furnizor",
        label: "furnizor primar",
        default: "EE",
        options: [
            {"PPE": "EE"}
        ]
    },
    {
        type: "select",
        name: "companyId",
        label: "company",
        required: true,
        options: "canale",
        oValue: "internal_id",
        oLabel: ["internal_id", "denumire"]
    },
    {
        type: "datetime",
        name: "solicitationDate",
        label: "solicitation date",
        default: new Date()
    },
    {
        type: "datetime",
        name: "validityEndDate",
        label: "validity end date",
        default: new Date()
    },
    {
        type: "datetime",
        name: "validityStartDate",
        label: "validity start date",
        default: new Date()
    },
    {
        type: "text",
        name: "notes",
        label: "notes"
    },
    // { },
];
