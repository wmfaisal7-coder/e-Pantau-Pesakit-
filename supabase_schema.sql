create extension if not exists pgcrypto;

create table if not exists users_profile (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text unique not null,
    role text not null default 'staff' check (role in ('admin','staff','viewer')),
    created_at timestamptz not null default now()
);

create table if not exists patients (
    id uuid primary key default gen_random_uuid(),
    patient_code text unique not null,
    full_name text not null,
    national_id text not null,
    address text,
    phone_number text not null,
    disease_type text not null,
    treatment_type text not null,
    patient_status text not null default 'Aktif'
        check (patient_status in ('Aktif','Tidak Aktif','Selesai Rawatan')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists appointments (
    id uuid primary key default gen_random_uuid(),
    appointment_code text unique not null,
    patient_id uuid not null references patients(id) on delete cascade,
    appointment_date date not null,
    appointment_time time not null,
    treatment_type text not null,
    clinic_or_officer text not null,
    manual_status text not null default 'Dijadualkan'
        check (manual_status in ('Dijadualkan','Selesai','Dibatalkan','Ditunda','Tidak Hadir')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists follow_ups (
    id uuid primary key default gen_random_uuid(),
    appointment_id uuid not null references appointments(id) on delete cascade,
    patient_id uuid not null references patients(id) on delete cascade,
    contact_status text not null default 'Belum Dihubungi'
        check (contact_status in ('Belum Dihubungi','Sudah Dihubungi','Tidak Berjaya Dihubungi','Jadual Semula','Menolak Rawatan')),
    follow_up_note text,
    follow_up_date date,
    handled_by text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace view appointment_monitoring_view as
select
    a.id,
    a.appointment_code,
    p.patient_code,
    p.full_name as patient_name,
    p.phone_number,
    p.disease_type,
    a.appointment_date,
    a.appointment_time,
    a.treatment_type,
    a.clinic_or_officer,
    a.manual_status,
    a.notes,
    case
        when a.manual_status = 'Selesai' then 'Selesai'
        when a.manual_status = 'Dibatalkan' then 'Dibatalkan'
        when a.manual_status = 'Tidak Hadir' then 'Terlepas'
        when a.appointment_date < current_date then 'Terlepas'
        when a.appointment_date = current_date then 'Hari Ini'
        when a.appointment_date between current_date + 1 and current_date + 3 then 'Akan Datang'
        else 'Dijadualkan'
    end as system_status,
    case
        when a.manual_status = 'Tidak Hadir' then 'Ya'
        when a.manual_status in ('Selesai','Dibatalkan') then 'Tidak'
        when a.appointment_date <= current_date then 'Ya'
        else 'Tidak'
    end as follow_up_required,
    (a.appointment_date - current_date) as days_remaining
from appointments a
join patients p on p.id = a.patient_id;


insert into patients (patient_code, full_name, national_id, address, phone_number, disease_type, treatment_type, patient_status, notes)
values
('P001', 'Siti Aminah binti Kassim', '900101-01-1234', 'No 12, Jalan Melur, Shah Alam', '012-3456789', 'Diabetes', 'Insulin', 'Aktif', 'Perlu datang setiap bulan'),
('P002', 'Ahmad Faiz bin Roslan', '880202-10-5678', 'No 8, Taman Murni, Klang', '013-9876543', 'Hipertensi', 'Ubat tekanan darah', 'Aktif', 'Pantau bacaan darah'),
('P003', 'Ravi Kumar a/l Subramaniam', '750505-14-2222', 'No 5, Jalan Kenanga, PJ', '016-2233445', 'Asma', 'Inhaler', 'Tidak Aktif', 'Berpindah klinik')
on conflict (patient_code) do nothing;

insert into appointments (appointment_code, patient_id, appointment_date, appointment_time, treatment_type, clinic_or_officer, manual_status, notes)
select 'T001', id, date '2026-04-18', time '09:00', 'Insulin', 'Klinik A', 'Dijadualkan', ''
from patients where patient_code = 'P001'
on conflict (appointment_code) do nothing;

insert into appointments (appointment_code, patient_id, appointment_date, appointment_time, treatment_type, clinic_or_officer, manual_status, notes)
select 'T002', id, date '2026-04-20', time '10:30', 'Ubat tekanan darah', 'Klinik A', 'Dijadualkan', ''
from patients where patient_code = 'P002'
on conflict (appointment_code) do nothing;

insert into appointments (appointment_code, patient_id, appointment_date, appointment_time, treatment_type, clinic_or_officer, manual_status, notes)
select 'T003', id, date '2026-04-25', time '11:00', 'Semakan susulan', 'Klinik A', 'Dijadualkan', ''
from patients where patient_code = 'P001'
on conflict (appointment_code) do nothing;

insert into appointments (appointment_code, patient_id, appointment_date, appointment_time, treatment_type, clinic_or_officer, manual_status, notes)
select 'T004', id, date '2026-04-15', time '08:30', 'Inhaler', 'Klinik B', 'Tidak Hadir', ''
from patients where patient_code = 'P003'
on conflict (appointment_code) do nothing;

insert into follow_ups (id, appointment_id, patient_id, contact_status, follow_up_note, follow_up_date, handled_by)
select gen_random_uuid(), a.id, p.id, 'Belum Dihubungi', '', null, null
from appointments a
join patients p on p.id = a.patient_id
where a.appointment_code in ('T001', 'T002', 'T004')
and not exists (
  select 1 from follow_ups f where f.appointment_id = a.id
);


-- Optional: aktifkan RLS selepas anda siap dengan dasar akses
-- alter table patients enable row level security;
-- alter table appointments enable row level security;
-- alter table follow_ups enable row level security;
-- alter table users_profile enable row level security;


create table if not exists app_settings (
    id uuid primary key default gen_random_uuid(),
    clinic_name text not null default 'Klinik A',
    theme text not null default 'Dark',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into app_settings (clinic_name, theme)
select 'Klinik A', 'Dark'
where not exists (select 1 from app_settings);
