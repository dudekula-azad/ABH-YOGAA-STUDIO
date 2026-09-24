// ============================================================
// ABH YOGAA STUDIO
// ADMIN LOGIN
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Admin Login JavaScript loaded."
        );


        if (!window.supabaseClient) {

            console.error(
                "Supabase client is not available."
            );

            return;

        }


        // ====================================================
        // CHECK EXISTING SESSION
        // ====================================================

        const {
            data: {
                session
            }
        } =
            await window.supabaseClient
                .auth
                .getSession();


        if (session) {

            const isAdmin =
                await checkAdmin();


            if (isAdmin) {

                window.location.replace =
                    "admin-dashboard.html";

                return;

            }

        }


        // ====================================================
        // LOGIN FORM
        // ====================================================

        const form =
            document.getElementById(
                "adminLoginForm"
            );


        form.addEventListener(
            "submit",
            loginAdmin
        );

    }
);


// ============================================================
// LOGIN
// ============================================================

async function loginAdmin(
    event
) {

    event.preventDefault();


    const email =
        document.getElementById(
            "adminEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "adminPassword"
        ).value;


    const button =
        document.getElementById(
            "loginBtn"
        );


    const message =
        document.getElementById(
            "loginMessage"
        );


    button.disabled =
        true;


    button.innerText =
        "Logging in...";


    message.innerText =
        "";


    try {

        // ====================================================
        // SUPABASE LOGIN
        // ====================================================

        const {
            data,
            error
        } =
            await window.supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            throw error;

        }


        console.log(
            "Admin authenticated:",
            data.user.id
        );


        // ====================================================
        // CHECK ADMIN PROFILE
        // ====================================================

        const isAdmin =
            await checkAdmin();


        if (!isAdmin) {

            await window.supabaseClient
                .auth
                .signOut();


            throw new Error(
                "This account is not authorized as an administrator."
            );

        }


        // ====================================================
        // SUCCESS
        // ====================================================

        message.className =
            "login-success";


        message.innerText =
            "Login successful. Redirecting...";


        setTimeout(
            () => {

                window.location.href =
                    "admin-dashboard.html";

            },
            500
        );

    }

    catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        message.className =
            "login-error";


        message.innerText =
            error.message ||
            "Login failed.";

    }

    finally {

        button.disabled =
            false;

        button.innerText =
            "Login";

    }

}


// ============================================================
// CHECK ADMIN
// ============================================================

async function checkAdmin() {

    try {

        const {
            data: {
                user
            },
            error: userError
        } =
            await window.supabaseClient
                .auth
                .getUser();


        if (userError) {

            console.error(
                "Could not get authenticated user:",
                userError
            );

            return false;

        }


        if (!user) {

            console.error(
                "No authenticated user found."
            );

            return false;

        }


        console.log(
            "Authenticated user:",
            user.id,
            user.email
        );


        // ====================================================
        // ASK DATABASE IF THIS USER IS ADMIN
        // ====================================================

        const {
            data: isAdmin,
            error: adminError
        } =
            await window.supabaseClient
                .rpc("is_admin");


        if (adminError) {

            console.error(
                "Admin authorization error:",
                adminError
            );

            return false;

        }


        console.log(
            "Database is_admin result:",
            isAdmin
        );


        return isAdmin === true;

    }

    catch (error) {

        console.error(
            "Admin check failed:",
            error
        );

        return false;

    }

}
