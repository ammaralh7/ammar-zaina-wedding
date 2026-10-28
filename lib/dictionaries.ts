import type { Locale } from "@/lib/wedding-config";

const en = {
  meta: {
    title: "Ammar & Zaina · RSVP",
    description: "Add your name, phone number and number of guests for Ammar & Zaina's wedding in Cairo on Tuesday, July 27, 2027.",
  },
  page: {
    monogram: "A & Z",
    names: "Ammar & Zaina",
    date: "Tuesday · 27 July 2027 · Cairo",
    switchLanguage: "العربية",
  },
  rsvp: {
    title: "Add your name",
    subtitle: "Kindly reply by June 27, 2027",
    nameLabel: "Full name",
    namePlaceholder: "e.g. Ahmed Hassan",
    phoneLabel: "Phone number",
    phonePlaceholder: "Phone number",
    phoneSearch: "Search countries…",
    phoneEmpty: "No country found.",
    partyLabel: "Number of guests",
    partyHint: "Including yourself",
    fewer: "One guest fewer",
    more: "One guest more",
    submit: "Send",
    update: "Save changes",
    sending: "Sending…",
    errors: {
      name: "Please enter your name.",
      party: "Please choose how many guests are coming.",
      phone: "Please enter a valid phone number, with the right country code.",
      notConfigured: "RSVPs aren't open yet. Please check back soon.",
      generic: "Something went wrong. Please try again.",
    },
  },
  confirmation: {
    title: "Thank you, {name}!",
    body: "We've saved your reply for {count}.",
    guestOne: "1 guest",
    guestMany: "{n} guests",
    saved: "Your reply is saved on this device.",
    change: "Edit my reply",
  },
  admin: {
    title: "Guest list",
    subtitle: "Live RSVPs for Ammar & Zaina",
    passwordLabel: "Admin password",
    login: "Enter",
    wrongPassword: "That password isn't right.",
    notConfigured: "Set ADMIN_PASSWORD and the Supabase keys to use this page.",
    logout: "Log out",
    refresh: "Refresh",
    exportCsv: "Export CSV",
    stats: {
      guests: "Guests attending",
      accepted: "Accepted",
      declined: "Declined",
      replies: "Total replies",
    },
    table: {
      search: "Search guests",
      all: "All",
      coming: "Coming",
      notComing: "Not coming",
      name: "Name",
      status: "Status",
      party: "Party",
      phone: "Phone",
      message: "Message",
      replied: "Replied",
      actions: "Actions",
      delete: "Delete",
      confirmDelete: "Delete the RSVP from {name}?",
      duplicate: "Possible duplicate",
      empty: "No RSVPs yet.",
      showing: "Showing {from} to {to} of {total}",
    },
  },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  meta: {
    title: "عمّار وزينة · تأكيد الحضور",
    description: "سجّل اسمك ورقم هاتفك وعدد الحضور لحفل زفاف عمّار وزينة في القاهرة يوم الثلاثاء ٢٧ يوليو ٢٠٢٧.",
  },
  page: {
    monogram: "ع ♡ ز",
    names: "عمّار وزينة",
    date: "الثلاثاء ٢٧ يوليو ٢٠٢٧ · القاهرة",
    switchLanguage: "English",
  },
  rsvp: {
    title: "تأكيد الحضور",
    subtitle: "نرجو التكرّم بالرد قبل ٢٧ يونيو ٢٠٢٧",
    nameLabel: "الاسم الكريم",
    namePlaceholder: "مثال: أحمد محمد حسن",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "رقم الهاتف",
    phoneSearch: "ابحث عن الدولة…",
    phoneEmpty: "لم يتم العثور على الدولة.",
    partyLabel: "عدد الحضور",
    partyHint: "بمن فيهم أنت",
    fewer: "إنقاص عدد الحضور",
    more: "زيادة عدد الحضور",
    submit: "إرسال",
    update: "حفظ التعديل",
    sending: "جارٍ الإرسال…",
    errors: {
      name: "فضلًا اكتب اسمك الكريم.",
      party: "فضلًا اختر عدد الحضور.",
      phone: "فضلًا اكتب رقم هاتف صحيحًا مع رمز الدولة.",
      notConfigured: "استقبال الردود لم يبدأ بعد، فضلًا حاول لاحقًا.",
      generic: "حدث خطأ ما، فضلًا حاول مرة أخرى.",
    },
  },
  confirmation: {
    title: "شكرًا لك يا {name}!",
    body: "تم تسجيل ردّك، وعدد الحضور: {count}",
    guestOne: "١",
    guestMany: "{n}",
    saved: "تم حفظ ردّك على هذا الجهاز.",
    change: "تعديل ردّي",
  },
  admin: {
    title: "قائمة الضيوف",
    subtitle: "الردود المباشرة لحفل عمّار وزينة",
    passwordLabel: "كلمة مرور المسؤول",
    login: "دخول",
    wrongPassword: "كلمة المرور غير صحيحة.",
    notConfigured: "أضف ADMIN_PASSWORD ومفاتيح Supabase لاستخدام هذه الصفحة.",
    logout: "تسجيل الخروج",
    refresh: "تحديث",
    exportCsv: "تصدير CSV",
    stats: {
      guests: "إجمالي الحضور",
      accepted: "قبول",
      declined: "اعتذار",
      replies: "إجمالي الردود",
    },
    table: {
      search: "ابحث عن ضيف",
      all: "الكل",
      coming: "سيحضر",
      notComing: "اعتذر",
      name: "الاسم",
      status: "الحالة",
      party: "العدد",
      phone: "الهاتف",
      message: "الرسالة",
      replied: "تاريخ الرد",
      actions: "إجراءات",
      delete: "حذف",
      confirmDelete: "حذف ردّ {name}؟",
      duplicate: "مكرر محتمل",
      empty: "لا توجد ردود بعد.",
      showing: "عرض {from} إلى {to} من {total}",
    },
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
