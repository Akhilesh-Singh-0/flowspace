"use client";

import { UserPlus } from "lucide-react";
import { Btn, Field, Head } from "@/components/landing/demo-parts";
import { typing, useScript, type Frame } from "@/components/landing/use-script";

const ROLES = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
} as const;

type Role = keyof typeof ROLES;
type Row = { name: string; email: string; role: Role };

type MembersState = {
  dialog: boolean;
  pressed: string | null;
  focus: "email" | "role" | null;
  email: string;
  role: Role;
  members: Row[];
  fresh: string | null;
};

const OWNER: Row = {
  name: "Maya Chen",
  email: "maya.chen@example.com",
  role: "OWNER",
};
const PRIYA: Row = {
  name: "Priya Nair",
  email: "priya.nair@example.com",
  role: "MEMBER",
};
const JON: Row = {
  name: "Jon Park",
  email: "jon.park@example.com",
  role: "ADMIN",
};
const SAM: Row = {
  name: "Sam Ortiz",
  email: "sam.ortiz@example.com",
  role: "VIEWER",
};

const initial: MembersState = {
  dialog: false,
  pressed: null,
  focus: null,
  email: "",
  role: "MEMBER",
  members: [OWNER, PRIYA],
  fresh: null,
};

const frames: Frame<MembersState>[] = [
  [1300, { pressed: "invite" }],
  [220, { pressed: null, dialog: true, focus: "email" }],
  [450, {}],
  ...typing<MembersState>(JON.email, 55, (t) => ({ email: t })),
  [450, { focus: "role" }],
  [650, { role: "ADMIN" }],
  [650, { pressed: "create" }],
  [
    220,
    {
      pressed: null,
      dialog: false,
      focus: null,
      email: "",
      role: "MEMBER",
      members: [OWNER, PRIYA, JON],
      fresh: JON.email,
    },
  ],
  [1500, { pressed: "invite" }],
  [220, { pressed: null, dialog: true, focus: "email" }],
  [450, {}],
  ...typing<MembersState>(SAM.email, 55, (t) => ({ email: t })),
  [450, { focus: "role" }],
  [650, { role: "VIEWER" }],
  [650, { pressed: "create" }],
  [
    220,
    {
      pressed: null,
      dialog: false,
      focus: null,
      email: "",
      role: "MEMBER",
      members: [OWNER, PRIYA, JON, SAM],
      fresh: SAM.email,
    },
  ],
];

export function MembersDemo() {
  const [ref, s] = useScript(initial, frames);

  return (
    <div
      ref={ref}
      className="lp-win lp-win-plain lp-win-short"
      role="img"
      aria-label="Animated demo of FlowSpace: two people are invited by email, one as an admin and one as a viewer"
    >
      <div className="lp-win-main" aria-hidden="true">
        <Head title="Members" text="Manage who has access to this workspace.">
          <Btn pressed={s.pressed === "invite"}>
            <UserPlus size={16} />
            Invite member
          </Btn>
        </Head>

        {s.members.map((member) => (
          <div
            key={member.email}
            className={`lp-app-row${member.email === s.fresh ? " is-new" : ""}`}
          >
            <span className="lp-app-ico lp-app-ico-round">
              {member.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="lp-app-name">{member.name}</span>
            <span className="lp-app-slug">{member.email}</span>
            <span className="lp-role">{ROLES[member.role]}</span>
          </div>
        ))}

        {s.dialog && (
          <div className="lp-dlg-back">
            <div className="lp-dlg">
              <p className="lp-dlg-title">Invite member</p>
              <div className="lp-dlg-body">
                <Field
                  label="Email address"
                  value={s.email}
                  placeholder="colleague@company.com"
                  focus={s.focus === "email"}
                />
                <Field
                  label="Role"
                  value={ROLES[s.role]}
                  focus={s.focus === "role"}
                  select
                />
              </div>
              <div className="lp-dlg-foot">
                <Btn ghost>Cancel</Btn>
                <Btn pressed={s.pressed === "create"}>Invite member</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
