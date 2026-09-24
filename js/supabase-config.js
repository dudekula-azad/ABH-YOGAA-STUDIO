// ============================================================
// ABH YOGAA STUDIO
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
    "https://ldaqgwxqekxghaytbjut.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9mZVbGAQci1fGw7PdCcAPw_nM-ZvNu0";


// ============================================================
// CREATE SUPABASE CLIENT
// ============================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {

                // Keep user logged in between pages
                persistSession: true,

                // Automatically refresh expired sessions
                autoRefreshToken: true,

                // Detect authentication information in URL
                detectSessionInUrl: true,

                // Browser storage
                storage: window.localStorage
            }
        }
    );


// ============================================================
// GLOBAL SUPABASE CLIENT
// ============================================================

window.supabaseClient =
    supabaseClient;


console.log(
    "Supabase connected successfully"
);


// ============================================================
// CHECK CURRENT SESSION
// ============================================================

(async function checkSupabaseSession() {

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(
                "Session check error:",
                error
            );

            return;

        }


        if (data && data.session) {

            console.log(
                "Supabase session active:",
                data.session.user.email
            );

        } else {

            console.log(
                "No active Supabase session."
            );

        }

    }

    catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }

})();


// ============================================================
// AUTH STATE LISTENER
// ============================================================

window.supabaseClient
    .auth
    .onAuthStateChange(
        (event, session) => {

            console.log(
                "AUTH EVENT:",
                event
            );


            if (session) {

                console.log(
                    "Authenticated user:",
                    session.user.email
                );

            } else {

                console.log(
                    "No authenticated user."
                );

            }

        }
    );


// ============================================================
// DATABASE CONNECTION TEST
// ============================================================

(async function testDatabaseConnection() {

    try {

        console.log(
            "Testing Supabase REST connection..."
        );


        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("services")
                .select(
                    "id,name,slug,is_active"
                )
                .limit(5);


        console.log(
            "TEST DATA:",
            data
        );


        console.log(
            "TEST ERROR:",
            error
        );

    }

    catch (error) {

        console.error(
            "Database test failed:",
            error
        );

    }

})();