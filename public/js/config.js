/* ==========================================================================
   KINGDOM CREW FELLOWSHIP — SITE SETTINGS
   This is the ONLY file you need to edit to update contact details, social
   links, sample events and gallery items. Save, refresh the browser, done.
   ========================================================================== */

window.KCF_CONFIG = {
  // ---- Identity ----------------------------------------------------------
  name: 'Kingdom Crew Fellowship',
  motto: 'One Faith. One Family. One Body in Christ.', // PROPOSED: confirm with leadership
  campus: 'University of Lay Adventists of Kigali (UNILAK), Rwamagana Campus, Rwanda',

  // ---- Contact (confirmed by the fellowship) -----------------------------
  email: 'kingdomcrew.unilak@gmail.com',
  phones: ['0796396448', '0791377615'],
  venue: 'Former Exam Hall, UNILAK Rwamagana Campus',
  meeting: { day: 'Every Sunday', time: '4:30 PM – 7:00 PM' },

  // ---- Backend address ---------------------------------------------------
  // '' = the website and the server are on the same address (Render / local).
  // If the website is on GitHub Pages, put your Render URL here, e.g.
  // 'https://kingdom-crew.onrender.com' (no slash at the end).
  apiBase: '',

  // ---- Social links ------------------------------------------------------
  // Paste the REAL profile URL between the quotes. Leave '' if you do not
  // have it yet: the button will show as "Coming soon" and will not link anywhere.
  social: {
    facebook:  { label: 'Facebook',  url: '', hint: 'Kingdom Crew Fellowship (Page)' },
    instagram: { label: 'Instagram', url: '', hint: '@kingdomcrew.unilak (to be confirmed)' },
    tiktok:    { label: 'TikTok',    url: '', hint: '@kingdomcrew.unilak (to be confirmed)' },
    youtube:   { label: 'YouTube',   url: '', hint: 'Kingdom Crew Fellowship (Channel)' },
    whatsapp:  { label: 'WhatsApp Community', url: 'https://chat.whatsapp.com/J2cefbJjeyB5vjQvc4KNkM?s=sw&p=a&mlu=4&ilr=4&iam=2', hint: 'Existing community invite link' },
  },

  // ---- Events -------------------------------------------------------------
  // Real events go here. Dates use YYYY-MM-DD. Set sample:false for real ones.
  // If the backend + database are running, events from the database are used instead.
  events: [
    {
      title: 'Sunday Fellowship Gathering',
      date: 'Every Sunday',
      time: '4:30 PM – 7:00 PM',
      venue: 'Former Exam Hall, UNILAK Rwamagana Campus',
      category: 'Fellowship',
      description: 'The weekly gathering of Kingdom Crew Fellowship. All UNILAK students are welcome.',
      sample: false,
    },
    {
      title: 'Prayer Night',
      date: 'Date to be announced',
      time: 'Time to be announced',
      venue: 'To be confirmed',
      category: 'Prayer',
      description: 'EXAMPLE CARD: shows how a special prayer programme will appear once leaders confirm details.',
      sample: true,
    },
    {
      title: 'Worship & Testimony Evening',
      date: 'Date to be announced',
      time: 'Time to be announced',
      venue: 'To be confirmed',
      category: 'Worship',
      description: 'EXAMPLE CARD: replace with an official announcement when ready.',
      sample: true,
    },
  ],

  // ---- Gallery ------------------------------------------------------------
  // Add photos you have permission to publish: put the file in public/images/
  // and add a line like { src: 'images/worship1.jpg', alt: 'Students worshipping', caption: 'Worship night' }
  // Items without "src" show as labelled placeholders.
  gallery: [
    { alt: 'Placeholder for a worship session photo', caption: 'Worship (sample)' },
    { alt: 'Placeholder for a prayer meeting photo', caption: 'Prayer (sample)' },
    { alt: 'Placeholder for a Bible study photo', caption: 'Bible study (sample)' },
    { alt: 'Placeholder for a fellowship gathering photo', caption: 'Fellowship (sample)' },
    { alt: 'Placeholder for an outreach photo', caption: 'Outreach (sample)' },
    { alt: 'Placeholder for an event poster', caption: 'Event poster (sample)' },
  ],
};
