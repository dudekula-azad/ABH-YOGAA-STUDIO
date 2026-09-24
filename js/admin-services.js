// ============================================================
// ABH YOGAA STUDIO
// ADMIN SERVICE MANAGEMENT
// ============================================================

console.log("Admin Services JavaScript loaded successfully.");


// ============================================================
// SUPABASE
// ============================================================

const db = window.supabaseClient;

const STORAGE_BUCKET = "service-images";


// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

async function checkAdmin() {

    if (!db) {
        window.location.href = "admin-login.html";
        return false;
    }

    try {

        const {
            data: { user },
            error: userError
        } = await db.auth.getUser();

        if (userError || !user) {
            window.location.href = "admin-login.html";
            return false;
        }

        const {
            data: isAdmin,
            error: adminError
        } = await db.rpc("is_admin");

        if (adminError || isAdmin !== true) {

            console.error(
                "Admin authorization failed:",
                adminError
            );

            await db.auth.signOut();

            window.location.href =
                "admin-login.html";

            return false;
        }

        console.log(
            "Admin authorized:",
            user.email
        );

        return true;

    }

    catch (error) {

        console.error(
            "Admin authorization error:",
            error
        );

        window.location.href =
            "admin-login.html";

        return false;
    }
}


// ============================================================
// DOM ELEMENTS
// ============================================================

const servicesAdminGrid =
    document.getElementById(
        "servicesAdminGrid"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );


// ============================================================
// CHECK SUPABASE
// ============================================================

if (!db) {

    console.error(
        "Supabase client is not available."
    );

    showStatus(
        "Supabase connection is not available.",
        "error"
    );
}


// ============================================================
// SERVICE ICONS
// ============================================================

function getServiceIcon(name) {

    const icons = {

        "Hatha Yoga":
            "🧘",

        "Ashtanga Yoga":
            "🧘",

        "Prenatal Yoga":
            "🤰",

        "Postnatal Yoga":
            "👩‍🍼",

        "Fertility Yoga":
            "🌸",

        "Kids Yoga":
            "👦",

        "Garbh Sanskar":
            "🤱",

        "Infant Massage":
            "👶",

        "Breastfeeding Education":
            "🍼",

        "Labor Management":
            "🤰",

        "Pilates":
            "🧘"

    };

    return icons[name] || "🧘";
}


// ============================================================
// LOAD SERVICES
// ============================================================

async function loadServices() {

    if (!db) {
        return;
    }

    servicesAdminGrid.innerHTML = `
        <div class="loading-message">
            Loading services...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await db

            .from("services")

            .select(`
                id,
                name,
                slug,
                short_description,
                description,
                benefits,
                image_url,
                is_active,
                is_coming_soon,
                display_order
            `)

            .order(
                "display_order",
                {
                    ascending: true,
                    nullsFirst: false
                }
            );


        if (error) {

            console.error(
                "Service loading error:",
                error
            );

            showStatus(
                error.message ||
                "Unable to load services.",
                "error"
            );

            servicesAdminGrid.innerHTML = `
                <div class="loading-message">
                    Unable to load services.
                </div>
            `;

            return;
        }


        if (!data || data.length === 0) {

            servicesAdminGrid.innerHTML = `
                <div class="loading-message">
                    No services found.
                </div>
            `;

            return;
        }


        renderServices(data);

    }

    catch (error) {

        console.error(
            "Unexpected service loading error:",
            error
        );

        showStatus(
            "Something went wrong while loading services.",
            "error"
        );

        servicesAdminGrid.innerHTML = `
            <div class="loading-message">
                Unable to load services.
            </div>
        `;

    }

}


// ============================================================
// RENDER SERVICES
// ============================================================

function renderServices(services) {

    servicesAdminGrid.innerHTML = "";


    services.forEach(service => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "service-admin-card";

        card.dataset.serviceId =
            service.id;


        // ----------------------------------------------------
        // IMAGE PREVIEW
        // ----------------------------------------------------

        const imagePreview =
            document.createElement(
                "div"
            );

        imagePreview.className =
            "service-image-preview";


        if (service.image_url) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                service.image_url;

            image.alt =
                service.name;

            image.loading =
                "lazy";

            imagePreview.appendChild(
                image
            );

        }

        else {

            imagePreview.innerHTML = `
                <div class="service-image-placeholder">
                    ${getServiceIcon(service.name)}
                </div>
            `;

        }


        // ----------------------------------------------------
        // SERVICE TITLE
        // ----------------------------------------------------

        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            service.name;


        // ----------------------------------------------------
        // SLUG
        // ----------------------------------------------------

        const slugText =
            document.createElement(
                "p"
            );

        slugText.textContent =
            `Slug: ${service.slug}`;


        // ----------------------------------------------------
        // SHORT DESCRIPTION
        // ----------------------------------------------------

        const shortLabel =
            document.createElement(
                "label"
            );

        shortLabel.textContent =
            "Short Description";


        const shortDescription =
            document.createElement(
                "input"
            );

        shortDescription.type =
            "text";

        shortDescription.value =
            service.short_description || "";

        shortDescription.dataset.field =
            "short_description";


        // ----------------------------------------------------
        // DESCRIPTION
        // ----------------------------------------------------

        const descriptionLabel =
            document.createElement(
                "label"
            );

        descriptionLabel.textContent =
            "Description";


        const description =
            document.createElement(
                "textarea"
            );

        description.value =
            service.description || "";

        description.dataset.field =
            "description";


        // ----------------------------------------------------
        // BENEFITS
        // ----------------------------------------------------

        const benefitsLabel =
            document.createElement(
                "label"
            );

        benefitsLabel.textContent =
            "Benefits";


        const benefits =
            document.createElement(
                "textarea"
            );

        benefits.value =
            service.benefits || "";

        benefits.dataset.field =
            "benefits";


        // ----------------------------------------------------
        // DISPLAY ORDER
        // ----------------------------------------------------

        const orderLabel =
            document.createElement(
                "label"
            );

        orderLabel.textContent =
            "Display Order";


        const displayOrder =
            document.createElement(
                "input"
            );

        displayOrder.type =
            "number";

        displayOrder.min =
            "0";

        displayOrder.step =
            "1";

        displayOrder.value =
            service.display_order ?? "";

        displayOrder.dataset.field =
            "display_order";


        // ----------------------------------------------------
        // STATUS OPTIONS
        // ----------------------------------------------------

        const statusRow =
            document.createElement(
                "div"
            );

        statusRow.className =
            "service-status-row";


        const activeLabel =
            document.createElement(
                "label"
            );


        const activeCheckbox =
            document.createElement(
                "input"
            );

        activeCheckbox.type =
            "checkbox";

        activeCheckbox.checked =
            service.is_active === true;

        activeCheckbox.dataset.field =
            "is_active";


        activeLabel.appendChild(
            activeCheckbox
        );

        activeLabel.appendChild(
            document.createTextNode(
                " Active"
            )
        );


        const comingSoonLabel =
            document.createElement(
                "label"
            );


        const comingSoonCheckbox =
            document.createElement(
                "input"
            );

        comingSoonCheckbox.type =
            "checkbox";

        comingSoonCheckbox.checked =
            service.is_coming_soon === true;

        comingSoonCheckbox.dataset.field =
            "is_coming_soon";


        comingSoonLabel.appendChild(
            comingSoonCheckbox
        );

        comingSoonLabel.appendChild(
            document.createTextNode(
                " Coming Soon"
            )
        );


        statusRow.appendChild(
            activeLabel
        );

        statusRow.appendChild(
            comingSoonLabel
        );


        // ----------------------------------------------------
        // IMAGE FILE INPUT
        // ----------------------------------------------------

        const fileInput =
            document.createElement(
                "input"
            );

        fileInput.type =
            "file";

        fileInput.accept =
            "image/jpeg,image/png,image/webp,image/avif";

        fileInput.style.display =
            "none";


        // ----------------------------------------------------
        // IMAGE UPLOAD BUTTON
        // ----------------------------------------------------

        const uploadButton =
            document.createElement(
                "button"
            );

        uploadButton.type =
            "button";

        uploadButton.className =
            "admin-btn upload-btn";

        uploadButton.textContent =
            service.image_url
                ? "Change Image"
                : "Upload Image";


        uploadButton.addEventListener(
            "click",
            () => {

                fileInput.click();

            }
        );


        // ----------------------------------------------------
        // IMAGE CHANGE
        // ----------------------------------------------------

        fileInput.addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }


                await uploadServiceImage(
                    service,
                    file,
                    imagePreview,
                    uploadButton
                );


                fileInput.value =
                    "";

            }
        );


        // ----------------------------------------------------
        // REMOVE IMAGE BUTTON
        // ----------------------------------------------------

        const removeButton =
            document.createElement(
                "button"
            );

        removeButton.type =
            "button";

        removeButton.className =
            "admin-btn remove-btn";

        removeButton.textContent =
            "Remove Image";

        removeButton.disabled =
            !service.image_url;


        removeButton.addEventListener(
            "click",
            async () => {

                await removeServiceImage(
                    service,
                    imagePreview,
                    uploadButton,
                    removeButton
                );

            }
        );


        // ----------------------------------------------------
        // SAVE BUTTON
        // ----------------------------------------------------

        const saveButton =
            document.createElement(
                "button"
            );

        saveButton.type =
            "button";

        saveButton.className =
            "admin-btn save-btn";

        saveButton.textContent =
            "Save Changes";


        saveButton.addEventListener(
            "click",
            async () => {

                await saveServiceChanges(
                    service,
                    card,
                    saveButton
                );

            }
        );


        // ----------------------------------------------------
        // ACTIONS
        // ----------------------------------------------------

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "service-admin-actions";


        actions.appendChild(
            uploadButton
        );

        actions.appendChild(
            removeButton
        );

        actions.appendChild(
            saveButton
        );


        // ----------------------------------------------------
        // BUILD CARD
        // ----------------------------------------------------

        card.appendChild(
            imagePreview
        );

        card.appendChild(
            title
        );

        card.appendChild(
            slugText
        );

        card.appendChild(
            shortLabel
        );

        card.appendChild(
            shortDescription
        );

        card.appendChild(
            descriptionLabel
        );

        card.appendChild(
            description
        );

        card.appendChild(
            benefitsLabel
        );

        card.appendChild(
            benefits
        );

        card.appendChild(
            orderLabel
        );

        card.appendChild(
            displayOrder
        );

        card.appendChild(
            statusRow
        );

        card.appendChild(
            fileInput
        );

        card.appendChild(
            actions
        );


        servicesAdminGrid.appendChild(
            card
        );

    });

}


// ============================================================
// UPLOAD SERVICE IMAGE
// ============================================================

async function uploadServiceImage(
    service,
    file,
    imagePreview,
    uploadButton
) {

    if (!db) {
        return;
    }


    // --------------------------------------------------------
    // VALIDATE FILE
    // --------------------------------------------------------

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif"
    ];


    if (!allowedTypes.includes(file.type)) {

        showStatus(
            "Please select a JPG, PNG, WEBP or AVIF image.",
            "error"
        );

        return;
    }


    // --------------------------------------------------------
    // SIZE LIMIT
    // --------------------------------------------------------

    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        showStatus(
            "Image must be smaller than 5 MB.",
            "error"
        );

        return;
    }


    uploadButton.disabled =
        true;

    uploadButton.textContent =
        "Uploading...";


    try {

        // ----------------------------------------------------
        // UNIQUE STORAGE PATH
        // ----------------------------------------------------

        const extension =
            getFileExtension(
                file.name
            );


        const fileName =
            `${service.slug}-${Date.now()}.${extension}`;


        const filePath =
            `${service.slug}/${fileName}`;


        console.log(
            "Uploading image:",
            filePath
        );


        // ----------------------------------------------------
        // UPLOAD
        // ----------------------------------------------------

        const {
            error: uploadError
        } = await db

            .storage

            .from(STORAGE_BUCKET)

            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type
                }
            );


        if (uploadError) {

            console.error(
                "Image upload error:",
                uploadError
            );

            showStatus(
                uploadError.message ||
                "Unable to upload image.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // PUBLIC URL
        // ----------------------------------------------------

        const {
            data: publicUrlData
        } = db

            .storage

            .from(STORAGE_BUCKET)

            .getPublicUrl(
                filePath
            );


        const publicUrl =
            publicUrlData.publicUrl;


        if (!publicUrl) {

            showStatus(
                "Image uploaded but public URL could not be created.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // UPDATE DATABASE
        // ----------------------------------------------------

        const {
            error: updateError
        } = await db

            .from("services")

            .update({
                image_url:
                    publicUrl
            })

            .eq(
                "id",
                service.id
            );


        if (updateError) {

            console.error(
                "Image URL update error:",
                updateError
            );

            showStatus(
                updateError.message ||
                "Image uploaded but database update failed.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // UPDATE LOCAL SERVICE OBJECT
        // ----------------------------------------------------

        service.image_url =
            publicUrl;


        // ----------------------------------------------------
        // UPDATE PREVIEW
        // ----------------------------------------------------

        imagePreview.innerHTML =
            "";

        const image =
            document.createElement(
                "img"
            );

        image.src =
            publicUrl;

        image.alt =
            service.name;

        imagePreview.appendChild(
            image
        );


        uploadButton.textContent =
            "Change Image";


        // Enable remove button

        const card =
            imagePreview.closest(
                ".service-admin-card"
            );


        const removeButton =
            card.querySelector(
                ".remove-btn"
            );


        if (removeButton) {

            removeButton.disabled =
                false;

        }


        showStatus(
            `${service.name} image updated successfully.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Unexpected image upload error:",
            error
        );

        showStatus(
            "Something went wrong while uploading the image.",
            "error"
        );

    }

    finally {

        uploadButton.disabled =
            false;

        if (
            service.image_url
        ) {

            uploadButton.textContent =
                "Change Image";

        }

        else {

            uploadButton.textContent =
                "Upload Image";

        }

    }

}


// ============================================================
// REMOVE SERVICE IMAGE
// ============================================================

async function removeServiceImage(
    service,
    imagePreview,
    uploadButton,
    removeButton
) {

    if (!db) {
        return;
    }


    if (!service.image_url) {
        return;
    }


    const confirmed =
        window.confirm(
            `Remove the image for ${service.name}?`
        );


    if (!confirmed) {
        return;
    }


    removeButton.disabled =
        true;

    removeButton.textContent =
        "Removing...";


    try {

        // ----------------------------------------------------
        // FIND STORAGE PATH
        // ----------------------------------------------------

        const storagePath =
            getStoragePathFromUrl(
                service.image_url
            );


        // ----------------------------------------------------
        // DELETE STORAGE FILE
        // ----------------------------------------------------

        if (storagePath) {

            const {
                error: removeError
            } = await db

                .storage

                .from(STORAGE_BUCKET)

                .remove([
                    storagePath
                ]);


            if (removeError) {

                console.warn(
                    "Storage image removal warning:",
                    removeError
                );

            }

        }


        // ----------------------------------------------------
        // CLEAR DATABASE URL
        // ----------------------------------------------------

        const {
            error: updateError
        } = await db

            .from("services")

            .update({
                image_url:
                    null
            })

            .eq(
                "id",
                service.id
            );


        if (updateError) {

            console.error(
                "Image URL removal error:",
                updateError
            );

            showStatus(
                updateError.message ||
                "Unable to remove image.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // UPDATE LOCAL OBJECT
        // ----------------------------------------------------

        service.image_url =
            null;


        // ----------------------------------------------------
        // UPDATE PREVIEW
        // ----------------------------------------------------

        imagePreview.innerHTML = `
            <div class="service-image-placeholder">
                ${getServiceIcon(service.name)}
            </div>
        `;


        uploadButton.textContent =
            "Upload Image";

        removeButton.disabled =
            true;


        showStatus(
            `${service.name} image removed.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Unexpected image removal error:",
            error
        );

        showStatus(
            "Something went wrong while removing the image.",
            "error"
        );

    }

    finally {

        removeButton.disabled =
            !service.image_url;

        removeButton.textContent =
            "Remove Image";

    }

}


// ============================================================
// SAVE SERVICE DETAILS
// ============================================================

async function saveServiceChanges(
    service,
    card,
    saveButton
) {

    if (!db) {
        return;
    }


    saveButton.disabled =
        true;

    saveButton.textContent =
        "Saving...";


    try {

        // ----------------------------------------------------
        // GET FORM VALUES
        // ----------------------------------------------------

        const shortDescription =
            card.querySelector(
                '[data-field="short_description"]'
            ).value.trim();


        const description =
            card.querySelector(
                '[data-field="description"]'
            ).value.trim();


        const benefits =
            card.querySelector(
                '[data-field="benefits"]'
            ).value.trim();


        const displayOrderValue =
            card.querySelector(
                '[data-field="display_order"]'
            ).value.trim();


        const isActive =
            card.querySelector(
                '[data-field="is_active"]'
            ).checked;


        const isComingSoon =
            card.querySelector(
                '[data-field="is_coming_soon"]'
            ).checked;


        // ----------------------------------------------------
        // VALIDATE DISPLAY ORDER
        // ----------------------------------------------------

        let displayOrder =
            null;


        if (
            displayOrderValue !== ""
        ) {

            displayOrder =
                Number(
                    displayOrderValue
                );


            if (
                !Number.isInteger(
                    displayOrder
                ) ||
                displayOrder < 0
            ) {

                showStatus(
                    `${service.name}: Display order must be a whole number.`,
                    "error"
                );

                return;
            }

        }


        // ----------------------------------------------------
        // UPDATE DATABASE
        // ----------------------------------------------------

        const {
            error
        } = await db

            .from("services")

            .update({

                short_description:
                    shortDescription || null,

                description:
                    description || null,

                benefits:
                    benefits || null,

                display_order:
                    displayOrder,

                is_active:
                    isActive,

                is_coming_soon:
                    isComingSoon

            })

            .eq(
                "id",
                service.id
            );


        if (error) {

            console.error(
                "Service update error:",
                error
            );

            showStatus(
                error.message ||
                `Unable to save ${service.name}.`,
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // UPDATE LOCAL OBJECT
        // ----------------------------------------------------

        service.short_description =
            shortDescription || null;

        service.description =
            description || null;

        service.benefits =
            benefits || null;

        service.display_order =
            displayOrder;

        service.is_active =
            isActive;

        service.is_coming_soon =
            isComingSoon;


        showStatus(
            `${service.name} saved successfully.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Unexpected service save error:",
            error
        );

        showStatus(
            "Something went wrong while saving the service.",
            "error"
        );

    }

    finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save Changes";

    }

}


// ============================================================
// GET FILE EXTENSION
// ============================================================

function getFileExtension(filename) {

    const parts =
        filename.split(".");


    if (parts.length < 2) {
        return "jpg";
    }


    return parts
        .pop()
        .toLowerCase();

}


// ============================================================
// GET STORAGE PATH FROM PUBLIC URL
// ============================================================

function getStoragePathFromUrl(url) {

    try {

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;


        const index =
            url.indexOf(
                marker
            );


        if (index === -1) {
            return null;
        }


        return decodeURIComponent(
            url.substring(
                index + marker.length
            )
        );

    }

    catch (error) {

        console.error(
            "Unable to determine storage path:",
            error
        );

        return null;
    }

}


// ============================================================
// STATUS MESSAGE
// ============================================================

function showStatus(
    message,
    type
) {

    if (!statusMessage) {
        return;
    }


    statusMessage.textContent =
        message;


    statusMessage.className =
        `status-message ${type}`;


    window.clearTimeout(
        showStatus.timeout
    );


    showStatus.timeout =
        window.setTimeout(
            () => {

                statusMessage.className =
                    "status-message";

                statusMessage.textContent =
                    "";

            },
            5000
        );

}
// ============================================================
// CREATE NEW SERVICE
// ============================================================

const addServiceForm =
    document.getElementById("addServiceForm");

const createServiceBtn =
    document.getElementById("createServiceBtn");


if (addServiceForm) {

    addServiceForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!db) {

                showStatus(
                    "Supabase connection is not available.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // GET FORM VALUES
            // ------------------------------------------------

            const name =
                document
                    .getElementById("newServiceName")
                    .value
                    .trim();


            const slug =
                document
                    .getElementById("newServiceSlug")
                    .value
                    .trim()
                    .toLowerCase();


            const shortDescription =
                document
                    .getElementById("newServiceShortDescription")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("newServiceDescription")
                    .value
                    .trim();


            const benefits =
                document
                    .getElementById("newServiceBenefits")
                    .value
                    .trim();


            const imageInput =
                document.getElementById(
                    "newServiceImage"
                );


            const displayOrderValue =
                document
                    .getElementById("newServiceDisplayOrder")
                    .value
                    .trim();


            const isActive =
                document
                    .getElementById("newServiceActive")
                    .checked;


            const isComingSoon =
                document
                    .getElementById("newServiceComingSoon")
                    .checked;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!name) {

                showStatus(
                    "Please enter the service name.",
                    "error"
                );

                return;
            }


            if (!slug) {

                showStatus(
                    "Please enter the service slug.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // VALIDATE SLUG
            // ------------------------------------------------

            const slugPattern =
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/;


            if (!slugPattern.test(slug)) {

                showStatus(
                    "Slug can contain only lowercase letters, numbers and hyphens.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // DISPLAY ORDER
            // ------------------------------------------------

            let displayOrder = null;


            if (displayOrderValue !== "") {

                displayOrder =
                    Number(displayOrderValue);


                if (
                    !Number.isInteger(displayOrder) ||
                    displayOrder < 0
                ) {

                    showStatus(
                        "Display order must be a whole number.",
                        "error"
                    );

                    return;
                }

            }


            // ------------------------------------------------
            // IMAGE VALIDATION
            // ------------------------------------------------

            const imageFile =
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
                    ? imageInput.files[0]
                    : null;


            if (imageFile) {

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/avif"
                ];


                if (
                    !allowedTypes.includes(
                        imageFile.type
                    )
                ) {

                    showStatus(
                        "Please select a JPG, PNG, WEBP or AVIF image.",
                        "error"
                    );

                    return;
                }


                const maxSize =
                    5 * 1024 * 1024;


                if (imageFile.size > maxSize) {

                    showStatus(
                        "Image must be smaller than 5 MB.",
                        "error"
                    );

                    return;
                }

            }


            // ------------------------------------------------
            // BUTTON STATE
            // ------------------------------------------------

            if (createServiceBtn) {

                createServiceBtn.disabled =
                    true;

                createServiceBtn.textContent =
                    "Creating...";
            }


            let createdService = null;


            try {

                // --------------------------------------------
                // CHECK DUPLICATE SLUG
                // --------------------------------------------

                const {
                    data: existingService,
                    error: slugCheckError
                } = await db

                    .from("services")

                    .select("id,name,slug")

                    .eq(
                        "slug",
                        slug
                    )

                    .maybeSingle();


                if (slugCheckError) {

                    throw slugCheckError;
                }


                if (existingService) {

                    throw new Error(
                        `A service with the slug "${slug}" already exists.`
                    );
                }


                // --------------------------------------------
                // CREATE SERVICE
                // --------------------------------------------

                const {
                    data,
                    error: createError
                } = await db

                    .from("services")

                    .insert({

                        name:
                            name,

                        slug:
                            slug,

                        short_description:
                            shortDescription || null,

                        description:
                            description || null,

                        benefits:
                            benefits || null,

                        image_url:
                            null,

                        is_active:
                            isActive,

                        is_coming_soon:
                            isComingSoon,

                        display_order:
                            displayOrder

                    })

                    .select(`

                        id,
                        name,
                        slug,
                        short_description,
                        description,
                        benefits,
                        image_url,
                        is_active,
                        is_coming_soon,
                        display_order

                    `)

                    .single();


                if (createError) {

                    throw createError;
                }


                createdService =
                    data;


                // --------------------------------------------
                // UPLOAD IMAGE IF SELECTED
                // --------------------------------------------

                if (imageFile) {

                    const extension =
                        getFileExtension(
                            imageFile.name
                        );


                    const fileName =
                        `${slug}-${Date.now()}.${extension}`;


                    const filePath =
                        `${slug}/${fileName}`;


                    const {
                        error: uploadError
                    } = await db

                        .storage

                        .from(
                            STORAGE_BUCKET
                        )

                        .upload(
                            filePath,
                            imageFile,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    imageFile.type
                            }
                        );


                    if (uploadError) {

                        // ------------------------------------
                        // ROLLBACK SERVICE IF IMAGE FAILS
                        // ------------------------------------

                        await db
                            .from("services")
                            .delete()
                            .eq(
                                "id",
                                createdService.id
                            );


                        throw new Error(
                            uploadError.message ||
                            "Service was created but image upload failed."
                        );
                    }


                    // ----------------------------------------
                    // GET PUBLIC URL
                    // ----------------------------------------

                    const {
                        data: publicUrlData
                    } = db

                        .storage

                        .from(
                            STORAGE_BUCKET
                        )

                        .getPublicUrl(
                            filePath
                        );


                    const publicUrl =
                        publicUrlData &&
                        publicUrlData.publicUrl;


                    if (!publicUrl) {

                        // ------------------------------------
                        // ROLLBACK
                        // ------------------------------------

                        await db
                            .storage
                            .from(
                                STORAGE_BUCKET
                            )
                            .remove([
                                filePath
                            ]);


                        await db
                            .from("services")
                            .delete()
                            .eq(
                                "id",
                                createdService.id
                            );


                        throw new Error(
                            "Image uploaded but public URL could not be created."
                        );
                    }


                    // ----------------------------------------
                    // SAVE IMAGE URL
                    // ----------------------------------------

                    const {
                        error: imageUpdateError
                    } = await db

                        .from("services")

                        .update({

                            image_url:
                                publicUrl

                        })

                        .eq(
                            "id",
                            createdService.id
                        );


                    if (imageUpdateError) {

                        // ------------------------------------
                        // ROLLBACK STORAGE IMAGE
                        // ------------------------------------

                        await db
                            .storage
                            .from(
                                STORAGE_BUCKET
                            )
                            .remove([
                                filePath
                            ]);


                        await db
                            .from("services")
                            .delete()
                            .eq(
                                "id",
                                createdService.id
                            );


                        throw imageUpdateError;
                    }


                    createdService.image_url =
                        publicUrl;

                }


                // --------------------------------------------
                // SUCCESS
                // --------------------------------------------

                showStatus(
                    `${name} created successfully.`,
                    "success"
                );


                // --------------------------------------------
                // RESET FORM
                // --------------------------------------------

                addServiceForm.reset();


                const activeCheckbox =
                    document.getElementById(
                        "newServiceActive"
                    );


                if (activeCheckbox) {

                    activeCheckbox.checked =
                        true;

                }


                // --------------------------------------------
                // RELOAD SERVICE CARDS
                // --------------------------------------------

                await loadServices();


            }

            catch (error) {

                console.error(
                    "Create service error:",
                    error
                );


                showStatus(
                    error.message ||
                    "Unable to create service.",
                    "error"
                );

            }

            finally {

                if (createServiceBtn) {

                    createServiceBtn.disabled =
                        false;

                    createServiceBtn.textContent =
                        "Create Service";

                }

            }

        }

    );

}
// ============================================================
// MEET YOUR INSTRUCTOR MANAGEMENT
// ============================================================

const INSTRUCTOR_STORAGE_BUCKET = "service-images";


// ============================================================
// LOAD INSTRUCTOR PROFILE
// ============================================================

async function loadInstructorProfile() {

    if (!db) {
        return;
    }

    try {

        const {
            data,
            error
        } = await db

            .from("instructor_profile")

            .select(`
                id,
                name,
                title,
                description,
                image_url,
                experience_value,
                experience_label,
                students_value,
                students_label,
                is_active
            `)

            .eq("id", 1)

            .maybeSingle();


        if (error) {

            console.error(
                "Instructor profile loading error:",
                error
            );

            showInstructorStatus(
                error.message ||
                "Unable to load instructor profile.",
                "error"
            );

            return;
        }


        if (!data) {

            showInstructorStatus(
                "Instructor profile was not found.",
                "error"
            );

            return;
        }


        // ====================================================
        // FILL FORM
        // ====================================================

        document.getElementById(
            "instructorName"
        ).value =
            data.name || "";


        document.getElementById(
            "instructorTitle"
        ).value =
            data.title || "";


        document.getElementById(
            "instructorDescription"
        ).value =
            data.description || "";


        document.getElementById(
            "instructorExperienceValue"
        ).value =
            data.experience_value || "";


        document.getElementById(
            "instructorExperienceLabel"
        ).value =
            data.experience_label || "";


        document.getElementById(
            "instructorStudentsValue"
        ).value =
            data.students_value || "";


        document.getElementById(
            "instructorStudentsLabel"
        ).value =
            data.students_label || "";


        document.getElementById(
            "instructorActive"
        ).checked =
            data.is_active === true;


        // ====================================================
        // IMAGE
        // ====================================================

        updateInstructorImagePreview(
            data.image_url
        );


        const removeButton =
            document.getElementById(
                "removeInstructorImageBtn"
            );

        removeButton.disabled =
            !data.image_url;


        // Store current profile locally

        window.currentInstructorProfile =
            data;


        console.log(
            "Instructor profile loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Unexpected instructor loading error:",
            error
        );

        showInstructorStatus(
            "Something went wrong while loading instructor information.",
            "error"
        );

    }

}


// ============================================================
// UPDATE IMAGE PREVIEW
// ============================================================

function updateInstructorImagePreview(
    imageUrl
) {

    const image =
        document.getElementById(
            "instructorImagePreview"
        );

    const placeholder =
        document.getElementById(
            "instructorImagePlaceholder"
        );


    if (imageUrl) {

        image.src =
            imageUrl;

        image.style.display =
            "block";

        placeholder.style.display =
            "none";

    }

    else {

        image.src =
            "";

        image.style.display =
            "none";

        placeholder.style.display =
            "flex";

    }

}


// ============================================================
// SAVE INSTRUCTOR PROFILE
// ============================================================

async function saveInstructorProfile() {

    if (!db) {
        return;
    }


    const saveButton =
        document.getElementById(
            "saveInstructorBtn"
        );


    const name =
        document.getElementById(
            "instructorName"
        ).value.trim();


    const title =
        document.getElementById(
            "instructorTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "instructorDescription"
        ).value.trim();


    const experienceValue =
        document.getElementById(
            "instructorExperienceValue"
        ).value.trim();


    const experienceLabel =
        document.getElementById(
            "instructorExperienceLabel"
        ).value.trim();


    const studentsValue =
        document.getElementById(
            "instructorStudentsValue"
        ).value.trim();


    const studentsLabel =
        document.getElementById(
            "instructorStudentsLabel"
        ).value.trim();


    const isActive =
        document.getElementById(
            "instructorActive"
        ).checked;


    // ====================================================
    // VALIDATION
    // ====================================================

    if (!name) {

        showInstructorStatus(
            "Please enter the instructor name.",
            "error"
        );

        return;
    }


    if (!title) {

        showInstructorStatus(
            "Please enter the instructor heading.",
            "error"
        );

        return;
    }


    if (!description) {

        showInstructorStatus(
            "Please enter the instructor description.",
            "error"
        );

        return;
    }


    saveButton.disabled =
        true;

    saveButton.textContent =
        "Saving...";


    try {

        const {
            error
        } = await db

            .from("instructor_profile")

            .update({

                name:
                    name,

                title:
                    title,

                description:
                    description,

                experience_value:
                    experienceValue,

                experience_label:
                    experienceLabel,

                students_value:
                    studentsValue,

                students_label:
                    studentsLabel,

                is_active:
                    isActive,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                1
            );


        if (error) {

            console.error(
                "Instructor save error:",
                error
            );

            showInstructorStatus(
                error.message ||
                "Unable to save instructor information.",
                "error"
            );

            return;
        }


        // Update local object

        if (!window.currentInstructorProfile) {

            window.currentInstructorProfile = {};

        }


        Object.assign(
            window.currentInstructorProfile,
            {

                name:
                    name,

                title:
                    title,

                description:
                    description,

                experience_value:
                    experienceValue,

                experience_label:
                    experienceLabel,

                students_value:
                    studentsValue,

                students_label:
                    studentsLabel,

                is_active:
                    isActive

            }
        );


        showInstructorStatus(
            "Instructor information saved successfully.",
            "success"
        );


        console.log(
            "Instructor profile saved successfully."
        );

    }

    catch (error) {

        console.error(
            "Unexpected instructor save error:",
            error
        );

        showInstructorStatus(
            "Something went wrong while saving instructor information.",
            "error"
        );

    }

    finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save Instructor";

    }

}


// ============================================================
// UPLOAD INSTRUCTOR IMAGE
// ============================================================

async function uploadInstructorImage(
    file
) {

    if (!db) {
        return;
    }


    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif"

    ];


    if (!allowedTypes.includes(file.type)) {

        showInstructorStatus(
            "Please select a JPG, PNG, WEBP or AVIF image.",
            "error"
        );

        return;
    }


    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        showInstructorStatus(
            "Image must be smaller than 5 MB.",
            "error"
        );

        return;
    }


    const uploadButton =
        document.getElementById(
            "uploadInstructorImageBtn"
        );


    uploadButton.disabled =
        true;

    uploadButton.textContent =
        "Uploading...";


    try {

        const extension =
            getFileExtension(
                file.name
            );


        const fileName =
            `instructor-${Date.now()}.${extension}`;


        const filePath =
            `instructor/${fileName}`;


        // ====================================================
        // UPLOAD
        // ====================================================

        const {
            error: uploadError
        } = await db

            .storage

            .from(
                INSTRUCTOR_STORAGE_BUCKET
            )

            .upload(
                filePath,
                file,
                {

                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type

                }
            );


        if (uploadError) {

            console.error(
                "Instructor image upload error:",
                uploadError
            );

            showInstructorStatus(
                uploadError.message ||
                "Unable to upload instructor image.",
                "error"
            );

            return;
        }


        // ====================================================
        // GET PUBLIC URL
        // ====================================================

        const {
            data: publicUrlData
        } = db

            .storage

            .from(
                INSTRUCTOR_STORAGE_BUCKET
            )

            .getPublicUrl(
                filePath
            );


        const publicUrl =
            publicUrlData.publicUrl;


        if (!publicUrl) {

            await db

                .storage

                .from(
                    INSTRUCTOR_STORAGE_BUCKET
                )

                .remove([
                    filePath
                ]);


            showInstructorStatus(
                "Image uploaded but public URL could not be created.",
                "error"
            );

            return;
        }


        // ====================================================
        // UPDATE DATABASE
        // ====================================================

        const {
            error: updateError
        } = await db

            .from("instructor_profile")

            .update({

                image_url:
                    publicUrl,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                1
            );


        if (updateError) {

            console.error(
                "Instructor image database update error:",
                updateError
            );


            // Remove uploaded image if DB update failed

            await db

                .storage

                .from(
                    INSTRUCTOR_STORAGE_BUCKET
                )

                .remove([
                    filePath
                ]);


            showInstructorStatus(
                updateError.message ||
                "Image uploaded but database update failed.",
                "error"
            );

            return;
        }


        // ====================================================
        // UPDATE LOCAL DATA
        // ====================================================

        if (!window.currentInstructorProfile) {

            window.currentInstructorProfile = {};

        }


        window.currentInstructorProfile.image_url =
            publicUrl;


        // ====================================================
        // UPDATE PREVIEW
        // ====================================================

        updateInstructorImagePreview(
            publicUrl
        );


        document.getElementById(
            "removeInstructorImageBtn"
        ).disabled =
            false;


        showInstructorStatus(
            "Instructor image uploaded successfully.",
            "success"
        );


        console.log(
            "Instructor image uploaded:",
            publicUrl
        );

    }

    catch (error) {

        console.error(
            "Unexpected instructor image upload error:",
            error
        );

        showInstructorStatus(
            "Something went wrong while uploading the instructor image.",
            "error"
        );

    }

    finally {

        uploadButton.disabled =
            false;

        uploadButton.textContent =
            "Upload Image";

    }

}


// ============================================================
// REMOVE INSTRUCTOR IMAGE
// ============================================================

async function removeInstructorImage() {

    if (!db) {
        return;
    }


    const removeButton =
        document.getElementById(
            "removeInstructorImageBtn"
        );


    const currentImage =
        window.currentInstructorProfile &&
        window.currentInstructorProfile.image_url;


    if (!currentImage) {

        return;
    }


    removeButton.disabled =
        true;

    removeButton.textContent =
        "Removing...";


    try {

        // ====================================================
        // FIND STORAGE PATH
        // ====================================================

        let storagePath =
            null;


        const marker =
            `/storage/v1/object/public/${INSTRUCTOR_STORAGE_BUCKET}/`;


        const markerIndex =
            currentImage.indexOf(
                marker
            );


        if (markerIndex !== -1) {

            storagePath =
                decodeURIComponent(
                    currentImage.substring(
                        markerIndex + marker.length
                    )
                );

        }


        // ====================================================
        // REMOVE STORAGE FILE
        // ====================================================

        if (storagePath) {

            const {
                error: removeError
            } = await db

                .storage

                .from(
                    INSTRUCTOR_STORAGE_BUCKET
                )

                .remove([
                    storagePath
                ]);


            if (removeError) {

                console.warn(
                    "Instructor image storage removal warning:",
                    removeError
                );

            }

        }


        // ====================================================
        // CLEAR DATABASE URL
        // ====================================================

        const {
            error: updateError
        } = await db

            .from("instructor_profile")

            .update({

                image_url:
                    null,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                1
            );


        if (updateError) {

            console.error(
                "Instructor image URL removal error:",
                updateError
            );

            showInstructorStatus(
                updateError.message ||
                "Unable to remove instructor image.",
                "error"
            );

            return;
        }


        // ====================================================
        // UPDATE LOCAL DATA
        // ====================================================

        window.currentInstructorProfile.image_url =
            null;


        updateInstructorImagePreview(
            null
        );


        removeButton.disabled =
            true;


        showInstructorStatus(
            "Instructor image removed successfully.",
            "success"
        );


    }

    catch (error) {

        console.error(
            "Unexpected instructor image removal error:",
            error
        );

        showInstructorStatus(
            "Something went wrong while removing the instructor image.",
            "error"
        );

    }

    finally {

        removeButton.disabled =
            !(
                window.currentInstructorProfile &&
                window.currentInstructorProfile.image_url
            );

        removeButton.textContent =
            "Remove Image";

    }

}


// ============================================================
// INSTRUCTOR STATUS MESSAGE
// ============================================================

function showInstructorStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "instructorStatusMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `status-message ${type}`;


    setTimeout(
        () => {

            element.className =
                "status-message";

            element.textContent =
                "";

        },
        5000
    );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const saveButton =
            document.getElementById(
                "saveInstructorBtn"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveInstructorProfile
            );

        }


        const uploadButton =
            document.getElementById(
                "uploadInstructorImageBtn"
            );


        const imageInput =
            document.getElementById(
                "instructorImage"
            );


        if (
            uploadButton &&
            imageInput
        ) {

            uploadButton.addEventListener(
                "click",
                () => {

                    imageInput.click();

                }
            );


            imageInput.addEventListener(
                "change",
                async event => {

                    const file =
                        event.target.files[0];


                    if (!file) {
                        return;
                    }


                    await uploadInstructorImage(
                        file
                    );


                    imageInput.value =
                        "";

                }
            );

        }


        const removeButton =
            document.getElementById(
                "removeInstructorImageBtn"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                removeInstructorImage
            );

        }


        loadInstructorProfile();

    }
);


// ============================================================
// START
// ============================================================

loadServices();
// ============================================================
// SPECIAL SESSIONS MANAGEMENT
// ============================================================

const SPECIAL_SESSION_STORAGE_BUCKET = "service-images";

let specialSessionsData = [];


// ============================================================
// LOAD SPECIAL SESSIONS
// ============================================================

async function loadSpecialSessions() {

    const list =
        document.getElementById(
            "specialSessionsAdminList"
        );

    if (!list || !db) {
        return;
    }

    list.innerHTML = `
        <div class="loading-message">
            Loading special sessions...
        </div>
    `;

    try {

        const {
            data,
            error
        } = await db
            .from("special_sessions")
            .select(`
                id,
                title,
                description,
                session_date,
                start_time,
                end_time,
                image_url,
                price,
                capacity,
                is_active,
                created_at,
                updated_at
            `)
            .order("session_date", {
                ascending: true
            })
            .order("start_time", {
                ascending: true
            });

        if (error) {

            console.error(
                "Special sessions loading error:",
                error
            );

            list.innerHTML = `
                <div class="loading-message">
                    Unable to load special sessions.
                </div>
            `;

            showSpecialSessionStatus(
                error.message ||
                "Unable to load special sessions.",
                "error"
            );

            return;
        }


        specialSessionsData =
            data || [];

        renderSpecialSessions(
            specialSessionsData
        );

    }

    catch (error) {

        console.error(
            "Unexpected special sessions loading error:",
            error
        );

        list.innerHTML = `
            <div class="loading-message">
                Unable to load special sessions.
            </div>
        `;

    }

}


// ============================================================
// RENDER SPECIAL SESSIONS
// ============================================================

function renderSpecialSessions(
    sessions
) {

    const list =
        document.getElementById(
            "specialSessionsAdminList"
        );

    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (!sessions || sessions.length === 0) {

        list.innerHTML = `
            <div class="loading-message">
                No special sessions found.
            </div>
        `;

        return;
    }


    sessions.forEach(
        session => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "special-session-admin-card";


            // =================================================
            // IMAGE
            // =================================================

            const imageContainer =
                document.createElement(
                    "div"
                );

            imageContainer.className =
                "special-session-admin-image";


            if (session.image_url) {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    session.image_url;

                image.alt =
                    session.title ||
                    "Special Yoga Session";

                image.loading =
                    "lazy";

                imageContainer.appendChild(
                    image
                );

            } else {

                const placeholder =
                    document.createElement(
                        "div"
                    );

                placeholder.className =
                    "special-session-admin-placeholder";

                placeholder.textContent =
                    "🧘";

                imageContainer.appendChild(
                    placeholder
                );

            }


            // =================================================
            // TITLE
            // =================================================

            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                session.title ||
                "Untitled Session";


            // =================================================
            // DESCRIPTION
            // =================================================

            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                session.description ||
                "No description available.";


            // =================================================
            // META
            // =================================================

            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "special-session-admin-meta";


            const dateRow =
                document.createElement(
                    "div"
                );

            dateRow.textContent =
                `📅 Date: ${formatSpecialSessionDate(
                    session.session_date
                )}`;


            const timeRow =
                document.createElement(
                    "div"
                );

            timeRow.textContent =
                `🕐 Time: ${formatSpecialSessionTime(
                    session.start_time,
                    session.end_time
                )}`;


            const priceRow =
                document.createElement(
                    "div"
                );

            priceRow.textContent =
                `💰 Price: ₹${Number(
                    session.price || 0
                ).toFixed(2)}`;


            const capacityRow =
                document.createElement(
                    "div"
                );

            capacityRow.textContent =
                `👥 Capacity: ${
                    session.capacity || 0
                }`;


            const statusRow =
                document.createElement(
                    "div"
                );

            statusRow.textContent =
                session.is_active
                    ? "🟢 Active"
                    : "🔴 Inactive";


            meta.appendChild(
                dateRow
            );

            meta.appendChild(
                timeRow
            );

            meta.appendChild(
                priceRow
            );

            meta.appendChild(
                capacityRow
            );

            meta.appendChild(
                statusRow
            );


            // =================================================
            // ACTIONS
            // =================================================

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "special-session-admin-card-actions";


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.type =
                "button";

            editButton.className =
                "special-session-edit-btn";

            editButton.textContent =
                "Edit";

            editButton.addEventListener(
                "click",
                () => {

                    editSpecialSession(
                        session.id
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "special-session-delete-btn";

            deleteButton.textContent =
                "Delete";

            deleteButton.addEventListener(
                "click",
                () => {

                    deleteSpecialSession(
                        session.id
                    );

                }
            );


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            // =================================================
            // BUILD CARD
            // =================================================

            card.appendChild(
                imageContainer
            );

            card.appendChild(
                title
            );

            card.appendChild(
                description
            );

            card.appendChild(
                meta
            );

            card.appendChild(
                actions
            );


            list.appendChild(
                card
            );

        }
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatSpecialSessionDate(
    date
) {

    if (!date) {
        return "Not specified";
    }

    try {

        const dateObject =
            new Date(
                `${date}T00:00:00`
            );

        return dateObject.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }

    catch (error) {

        return date;

    }

}


// ============================================================
// FORMAT TIME
// ============================================================

function formatSpecialSessionTime(
    startTime,
    endTime
) {

    if (!startTime) {
        return "Not specified";
    }

    const formatTime =
        time => {

            const parts =
                time.split(":");

            const hours =
                Number(parts[0]);

            const minutes =
                Number(parts[1] || 0);

            const suffix =
                hours >= 12
                    ? "PM"
                    : "AM";

            const displayHour =
                hours % 12 || 12;

            return `${displayHour}:${
                String(minutes).padStart(2, "0")
            } ${suffix}`;

        };


    const start =
        formatTime(startTime);


    if (!endTime) {
        return start;
    }


    return `${start} - ${formatTime(endTime)}`;

}


// ============================================================
// EDIT SPECIAL SESSION
// ============================================================

function editSpecialSession(
    sessionId
) {

    const session =
        specialSessionsData.find(
            item =>
                String(item.id) ===
                String(sessionId)
        );


    if (!session) {

        showSpecialSessionStatus(
            "Special session was not found.",
            "error"
        );

        return;
    }


    document.getElementById(
        "specialSessionId"
    ).value =
        session.id;


    document.getElementById(
        "specialSessionTitle"
    ).value =
        session.title || "";


    document.getElementById(
        "specialSessionDate"
    ).value =
        session.session_date || "";


    document.getElementById(
        "specialSessionStartTime"
    ).value =
        session.start_time
            ? session.start_time.substring(0, 5)
            : "";


    document.getElementById(
        "specialSessionEndTime"
    ).value =
        session.end_time
            ? session.end_time.substring(0, 5)
            : "";


    document.getElementById(
        "specialSessionPrice"
    ).value =
        session.price ?? "";


    document.getElementById(
        "specialSessionCapacity"
    ).value =
        session.capacity ?? "";


    document.getElementById(
        "specialSessionDescription"
    ).value =
        session.description || "";


    document.getElementById(
        "specialSessionActive"
    ).checked =
        session.is_active === true;


    const saveButton =
        document.getElementById(
            "saveSpecialSessionBtn"
        );

    const cancelButton =
        document.getElementById(
            "cancelSpecialSessionBtn"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Special Session";

    }


    if (cancelButton) {

        cancelButton.style.display =
            "inline-block";

    }


    // Create/remove image button for editing

    setupSpecialSessionImageRemoveButton(
        session
    );


    const form =
        document.getElementById(
            "specialSessionForm"
        );

    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// ============================================================
// RESET SPECIAL SESSION FORM
// ============================================================

function resetSpecialSessionForm() {

    const form =
        document.getElementById(
            "specialSessionForm"
        );

    if (form) {
        form.reset();
    }


    document.getElementById(
        "specialSessionId"
    ).value = "";


    document.getElementById(
        "specialSessionActive"
    ).checked = true;


    const saveButton =
        document.getElementById(
            "saveSpecialSessionBtn"
        );

    if (saveButton) {

        saveButton.textContent =
            "Add Special Session";

    }


    const cancelButton =
        document.getElementById(
            "cancelSpecialSessionBtn"
        );

    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    removeSpecialSessionImageRemoveButton();

}


// ============================================================
// SAVE SPECIAL SESSION
// ============================================================

async function saveSpecialSession(
    event
) {

    event.preventDefault();


    if (!db) {
        return;
    }


    const saveButton =
        document.getElementById(
            "saveSpecialSessionBtn"
        );


    const sessionId =
        document.getElementById(
            "specialSessionId"
        ).value.trim();


    const title =
        document.getElementById(
            "specialSessionTitle"
        ).value.trim();


    const sessionDate =
        document.getElementById(
            "specialSessionDate"
        ).value;


    const startTime =
        document.getElementById(
            "specialSessionStartTime"
        ).value;


    const endTime =
        document.getElementById(
            "specialSessionEndTime"
        ).value;


    const description =
        document.getElementById(
            "specialSessionDescription"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "specialSessionPrice"
            ).value
        );


    const capacity =
        Number(
            document.getElementById(
                "specialSessionCapacity"
            ).value
        );


    const isActive =
        document.getElementById(
            "specialSessionActive"
        ).checked;


    const imageInput =
        document.getElementById(
            "specialSessionImage"
        );


    const imageFile =
        imageInput &&
        imageInput.files &&
        imageInput.files[0]
            ? imageInput.files[0]
            : null;


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!title) {

        showSpecialSessionStatus(
            "Please enter the session title.",
            "error"
        );

        return;
    }


    if (!sessionDate) {

        showSpecialSessionStatus(
            "Please select the session date.",
            "error"
        );

        return;
    }


    if (!startTime) {

        showSpecialSessionStatus(
            "Please select the start time.",
            "error"
        );

        return;
    }


    if (
        endTime &&
        endTime <= startTime
    ) {

        showSpecialSessionStatus(
            "End time must be after the start time.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        showSpecialSessionStatus(
            "Please enter a valid price.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(capacity) ||
        capacity < 1
    ) {

        showSpecialSessionStatus(
            "Capacity must be at least 1.",
            "error"
        );

        return;
    }


    // ========================================================
    // IMAGE VALIDATION
    // ========================================================

    if (imageFile) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif"
        ];


        if (
            !allowedTypes.includes(
                imageFile.type
            )
        ) {

            showSpecialSessionStatus(
                "Please select a JPG, PNG, WEBP or AVIF image.",
                "error"
            );

            return;
        }


        if (
            imageFile.size >
            5 * 1024 * 1024
        ) {

            showSpecialSessionStatus(
                "Image must be smaller than 5 MB.",
                "error"
            );

            return;
        }

    }


    saveButton.disabled =
        true;

    saveButton.textContent =
        sessionId
            ? "Updating..."
            : "Creating...";


    let uploadedImagePath =
        null;


    try {

        // ====================================================
        // EXISTING SESSION
        // ====================================================

        let existingSession =
            null;


        if (sessionId) {

            existingSession =
                specialSessionsData.find(
                    item =>
                        String(item.id) ===
                        String(sessionId)
                );

        }


        let imageUrl =
            existingSession
                ? existingSession.image_url
                : null;


        // ====================================================
        // UPLOAD NEW IMAGE
        // ====================================================

        if (imageFile) {

            const extension =
                getFileExtension(
                    imageFile.name
                );


            const fileName =
                `special-${Date.now()}.${extension}`;


            uploadedImagePath =
                `special-sessions/${fileName}`;


            const {
                error: uploadError
            } = await db
                .storage
                .from(
                    SPECIAL_SESSION_STORAGE_BUCKET
                )
                .upload(
                    uploadedImagePath,
                    imageFile,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            imageFile.type
                    }
                );


            if (uploadError) {

                console.error(
                    "Special session image upload error:",
                    uploadError
                );

                throw uploadError;

            }


            const {
                data: publicUrlData
            } = db
                .storage
                .from(
                    SPECIAL_SESSION_STORAGE_BUCKET
                )
                .getPublicUrl(
                    uploadedImagePath
                );


            imageUrl =
                publicUrlData &&
                publicUrlData.publicUrl
                    ? publicUrlData.publicUrl
                    : null;


            if (!imageUrl) {

                await db
                    .storage
                    .from(
                        SPECIAL_SESSION_STORAGE_BUCKET
                    )
                    .remove([
                        uploadedImagePath
                    ]);

                uploadedImagePath =
                    null;

                throw new Error(
                    "Unable to create the public image URL."
                );

            }

        }


        // ====================================================
        // DATABASE DATA
        // ====================================================

        const sessionData = {

            title,

            description:
                description || null,

            session_date:
                sessionDate,

            start_time:
                startTime,

            end_time:
                endTime || null,

            image_url:
                imageUrl || null,

            price,

            capacity,

            is_active:
                isActive,

            updated_at:
                new Date().toISOString()

        };


        // ====================================================
        // UPDATE
        // ====================================================

        if (sessionId) {

            const {
                error
            } = await db
                .from(
                    "special_sessions"
                )
                .update(
                    sessionData
                )
                .eq(
                    "id",
                    sessionId
                );


            if (error) {

                if (uploadedImagePath) {

                    await db
                        .storage
                        .from(
                            SPECIAL_SESSION_STORAGE_BUCKET
                        )
                        .remove([
                            uploadedImagePath
                        ]);

                }

                throw error;

            }


            // Remove old image after DB update

            if (
                imageFile &&
                existingSession &&
                existingSession.image_url &&
                existingSession.image_url !== imageUrl
            ) {

                const oldPath =
                    getStoragePathFromSpecialSessionUrl(
                        existingSession.image_url
                    );


                if (oldPath) {

                    await db
                        .storage
                        .from(
                            SPECIAL_SESSION_STORAGE_BUCKET
                        )
                        .remove([
                            oldPath
                        ]);

                }

            }


            showSpecialSessionStatus(
                "Special session updated successfully.",
                "success"
            );

        }


        // ====================================================
        // CREATE
        // ====================================================

        else {

            const {
                error
            } = await db
                .from(
                    "special_sessions"
                )
                .insert({

                    title,

                    description:
                        description || null,

                    session_date:
                        sessionDate,

                    start_time:
                        startTime,

                    end_time:
                        endTime || null,

                    image_url:
                        imageUrl || null,

                    price,

                    capacity,

                    is_active:
                        isActive

                });


            if (error) {

                if (uploadedImagePath) {

                    await db
                        .storage
                        .from(
                            SPECIAL_SESSION_STORAGE_BUCKET
                        )
                        .remove([
                            uploadedImagePath
                        ]);

                }

                throw error;

            }


            showSpecialSessionStatus(
                "Special session created successfully.",
                "success"
            );

        }


        resetSpecialSessionForm();

        await loadSpecialSessions();

    }

    catch (error) {

        console.error(
            "Special session save error:",
            error
        );

        showSpecialSessionStatus(
            error.message ||
            "Unable to save special session.",
            "error"
        );

    }

    finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            document.getElementById(
                "specialSessionId"
            ).value
                ? "Update Special Session"
                : "Add Special Session";

    }

}


// ============================================================
// DELETE SPECIAL SESSION
// ============================================================

async function deleteSpecialSession(
    sessionId
) {

    if (!db) {
        return;
    }


    const session =
        specialSessionsData.find(
            item =>
                String(item.id) ===
                String(sessionId)
        );


    if (!session) {

        showSpecialSessionStatus(
            "Special session was not found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${session.title}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await db
            .from(
                "special_sessions"
            )
            .delete()
            .eq(
                "id",
                sessionId
            );


        if (error) {
            throw error;
        }


        // Remove associated image

        if (session.image_url) {

            const storagePath =
                getStoragePathFromSpecialSessionUrl(
                    session.image_url
                );


            if (storagePath) {

                const {
                    error:
                        storageError
                } = await db
                    .storage
                    .from(
                        SPECIAL_SESSION_STORAGE_BUCKET
                    )
                    .remove([
                        storagePath
                    ]);


                if (storageError) {

                    console.warn(
                        "Special session image removal warning:",
                        storageError
                    );

                }

            }

        }


        showSpecialSessionStatus(
            "Special session deleted successfully.",
            "success"
        );


        resetSpecialSessionForm();

        await loadSpecialSessions();

    }

    catch (error) {

        console.error(
            "Special session delete error:",
            error
        );

        showSpecialSessionStatus(
            error.message ||
            "Unable to delete special session.",
            "error"
        );

    }

}


// ============================================================
// SPECIAL SESSION STORAGE PATH
// ============================================================

function getStoragePathFromSpecialSessionUrl(
    url
) {

    if (!url) {
        return null;
    }


    try {

        const marker =
            `/storage/v1/object/public/${SPECIAL_SESSION_STORAGE_BUCKET}/`;


        const index =
            url.indexOf(marker);


        if (index === -1) {
            return null;
        }


        return decodeURIComponent(
            url.substring(
                index + marker.length
            )
        );

    }

    catch (error) {

        console.error(
            "Unable to determine special session image path:",
            error
        );

        return null;

    }

}


// ============================================================
// IMAGE REMOVE BUTTON
// ============================================================

function setupSpecialSessionImageRemoveButton(
    session
) {

    removeSpecialSessionImageRemoveButton();


    if (
        !session ||
        !session.image_url
    ) {
        return;
    }


    const imageInput =
        document.getElementById(
            "specialSessionImage"
        );


    if (!imageInput) {
        return;
    }


    const wrapper =
        imageInput.parentElement;


    if (!wrapper) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.id =
        "removeSpecialSessionImageBtn";

    button.className =
        "special-session-cancel-btn";

    button.textContent =
        "Remove Current Image";


    button.addEventListener(
        "click",
        async () => {

            await removeSpecialSessionImage(
                session
            );

        }
    );


    wrapper.appendChild(
        button
    );

}


// ============================================================
// REMOVE CURRENT IMAGE
// ============================================================

async function removeSpecialSessionImage(
    session
) {

    if (
        !db ||
        !session ||
        !session.id
    ) {
        return;
    }


    const confirmed =
        window.confirm(
            "Remove the current session image?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const storagePath =
            getStoragePathFromSpecialSessionUrl(
                session.image_url
            );


        if (storagePath) {

            const {
                error:
                    storageError
            } = await db
                .storage
                .from(
                    SPECIAL_SESSION_STORAGE_BUCKET
                )
                .remove([
                    storagePath
                ]);


            if (storageError) {

                console.warn(
                    "Special session image storage removal warning:",
                    storageError
                );

            }

        }


        const {
            error
        } = await db
            .from(
                "special_sessions"
            )
            .update({

                image_url:
                    null,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                session.id
            );


        if (error) {
            throw error;
        }


        session.image_url =
            null;


        showSpecialSessionStatus(
            "Session image removed successfully.",
            "success"
        );


        await loadSpecialSessions();

        setupSpecialSessionImageRemoveButton(
            session
        );

    }

    catch (error) {

        console.error(
            "Special session image removal error:",
            error
        );

        showSpecialSessionStatus(
            error.message ||
            "Unable to remove session image.",
            "error"
        );

    }

}


// ============================================================
// REMOVE IMAGE BUTTON
// ============================================================

function removeSpecialSessionImageRemoveButton() {

    const button =
        document.getElementById(
            "removeSpecialSessionImageBtn"
        );


    if (button) {
        button.remove();
    }

}


// ============================================================
// STATUS MESSAGE
// ============================================================

function showSpecialSessionStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "specialSessionStatusMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `status-message ${type}`;


    window.clearTimeout(
        showSpecialSessionStatus.timeout
    );


    showSpecialSessionStatus.timeout =
        window.setTimeout(
            () => {

                element.className =
                    "status-message";

                element.textContent =
                    "";

            },
            5000
        );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const authorized =
            await checkAdmin();


        if (!authorized) {
            return;
        }


        const form =
            document.getElementById(
                "specialSessionForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                saveSpecialSession
            );

        }


        const cancelButton =
            document.getElementById(
                "cancelSpecialSessionBtn"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                resetSpecialSessionForm
            );

        }


        await loadSpecialSessions();

    }
);
// ============================================================
// CUSTOMER REVIEWS MANAGEMENT
// ============================================================

let adminReviewsData = [];

let currentReviewFilter = "pending";


// ============================================================
// LOAD REVIEWS
// ============================================================

async function loadAdminReviews() {

    const list =
        document.getElementById(
            "reviewsAdminList"
        );

    if (!list || !db) {
        return;
    }


    list.innerHTML = `
        <div class="loading-message">
            Loading customer reviews...
        </div>
    `;


    try {

        const {
            data: reviews,
            error
        } = await db
            .from("reviews")
            .select(`
                id,
                customer_id,
                service_id,
                rating,
                review_text,
                status,
                approved_at,
                created_at,
                updated_at
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Admin reviews loading error:",
                error
            );

            showReviewAdminStatus(
                error.message ||
                "Unable to load reviews.",
                "error"
            );

            list.innerHTML = `
                <div class="reviews-empty-message">
                    Unable to load reviews.
                </div>
            `;

            return;
        }


        adminReviewsData =
            reviews || [];


        // ====================================================
        // LOAD CUSTOMER NAMES
        // ====================================================

        const customerIds =
            [
                ...new Set(
                    adminReviewsData
                        .map(
                            review =>
                                review.customer_id
                        )
                        .filter(Boolean)
                )
            ];


        let customersMap = {};


        if (customerIds.length > 0) {

            const {
                data: customers,
                error: customerError
            } = await db
                .from("customers")
                .select(
                    "id, full_name, email"
                )
                .in(
                    "id",
                    customerIds
                );


            if (customerError) {

                console.warn(
                    "Customer names loading warning:",
                    customerError
                );

            } else {

                (customers || [])
                    .forEach(
                        customer => {

                            customersMap[
                                customer.id
                            ] = customer;

                        }
                    );

            }

        }


        // ====================================================
        // LOAD SERVICE NAMES
        // ====================================================

        const serviceIds =
            [
                ...new Set(
                    adminReviewsData
                        .map(
                            review =>
                                review.service_id
                        )
                        .filter(Boolean)
                )
            ];


        let servicesMap = {};


        if (serviceIds.length > 0) {

            const {
                data: services,
                error: serviceError
            } = await db
                .from("services")
                .select(
                    "id, name"
                )
                .in(
                    "id",
                    serviceIds
                );


            if (serviceError) {

                console.warn(
                    "Review service names loading warning:",
                    serviceError
                );

            } else {

                (services || [])
                    .forEach(
                        service => {

                            servicesMap[
                                service.id
                            ] = service;

                        }
                    );

            }

        }


        // ====================================================
        // ATTACH DISPLAY INFORMATION
        // ====================================================

        adminReviewsData =
            adminReviewsData.map(
                review => ({

                    ...review,

                    customer:
                        customersMap[
                            review.customer_id
                        ] || null,

                    service:
                        servicesMap[
                            review.service_id
                        ] || null

                })
            );


        renderAdminReviews();

    }

    catch (error) {

        console.error(
            "Unexpected admin reviews error:",
            error
        );

        list.innerHTML = `
            <div class="reviews-empty-message">
                Unable to load customer reviews.
            </div>
        `;

    }

}


// ============================================================
// RENDER REVIEWS
// ============================================================

function renderAdminReviews() {

    const list =
        document.getElementById(
            "reviewsAdminList"
        );


    if (!list) {
        return;
    }


    let filteredReviews =
        adminReviewsData;


    if (
        currentReviewFilter !==
        "all"
    ) {

        filteredReviews =
            adminReviewsData.filter(
                review =>
                    review.status ===
                    currentReviewFilter
            );

    }


    list.innerHTML = "";


    if (
        filteredReviews.length ===
        0
    ) {

        list.innerHTML = `

            <div class="reviews-empty-message">

                No ${
                    currentReviewFilter === "all"
                        ? ""
                        : currentReviewFilter
                }
                reviews found.

            </div>

        `;

        return;
    }


    filteredReviews.forEach(
        review => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                `review-admin-card ${
                    review.status || "pending"
                }`;


            // =================================================
            // HEADER
            // =================================================

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "review-admin-header-row";


            const customerArea =
                document.createElement(
                    "div"
                );


            const customerName =
                document.createElement(
                    "div"
                );


            customerName.className =
                "review-admin-customer";


            customerName.textContent =
                review.customer &&
                review.customer.full_name
                    ? review.customer.full_name
                    : review.customer &&
                      review.customer.email
                        ? review.customer.email
                        : "Customer";


            const serviceName =
                document.createElement(
                    "div"
                );


            serviceName.className =
                "review-admin-service";


            serviceName.textContent =
                review.service &&
                review.service.name
                    ? review.service.name
                    : "General Review";


            customerArea.appendChild(
                customerName
            );


            customerArea.appendChild(
                serviceName
            );


            // =================================================
            // RATING
            // =================================================

            const rating =
                document.createElement(
                    "div"
                );


            rating.className =
                "review-admin-rating";


            const ratingValue =
                Number(
                    review.rating || 0
                );


            rating.textContent =
                "★".repeat(
                    Math.max(
                        0,
                        Math.min(
                            5,
                            ratingValue
                        )
                    )
                ) +
                "☆".repeat(
                    Math.max(
                        0,
                        5 - ratingValue
                    )
                );


            header.appendChild(
                customerArea
            );


            header.appendChild(
                rating
            );


            // =================================================
            // REVIEW TEXT
            // =================================================

            const reviewText =
                document.createElement(
                    "div"
                );


            reviewText.className =
                "review-admin-text";


            reviewText.textContent =
                review.review_text ||
                "No review text.";


            // =================================================
            // META
            // =================================================

            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "review-admin-meta";


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                `review-admin-status ${
                    review.status || "pending"
                }`;


            status.textContent =
                review.status ||
                "pending";


            const date =
                document.createElement(
                    "div"
                );


            date.textContent =
                `Submitted: ${
                    formatReviewAdminDate(
                        review.created_at
                    )
                }`;


            meta.appendChild(
                status
            );


            meta.appendChild(
                date
            );


            if (
                review.approved_at
            ) {

                const approvedDate =
                    document.createElement(
                        "div"
                    );


                approvedDate.textContent =
                    `Approved: ${
                        formatReviewAdminDate(
                            review.approved_at
                        )
                    }`;


                meta.appendChild(
                    approvedDate
                );

            }


            // =================================================
            // ACTIONS
            // =================================================

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "review-admin-actions";


            if (
                review.status !==
                "approved"
            ) {

                const approveButton =
                    document.createElement(
                        "button"
                    );


                approveButton.type =
                    "button";


                approveButton.className =
                    "review-approve-btn";


                approveButton.textContent =
                    "Approve";


                approveButton.addEventListener(
                    "click",
                    () => {

                        approveAdminReview(
                            review.id
                        );

                    }
                );


                actions.appendChild(
                    approveButton
                );

            }


            if (
                review.status !==
                "rejected"
            ) {

                const rejectButton =
                    document.createElement(
                        "button"
                    );


                rejectButton.type =
                    "button";


                rejectButton.className =
                    "review-reject-btn";


                rejectButton.textContent =
                    "Reject";


                rejectButton.addEventListener(
                    "click",
                    () => {

                        rejectAdminReview(
                            review.id
                        );

                    }
                );


                actions.appendChild(
                    rejectButton
                );

            }


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "review-delete-btn";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteAdminReview(
                        review.id
                    );

                }
            );


            actions.appendChild(
                deleteButton
            );


            // =================================================
            // BUILD CARD
            // =================================================

            card.appendChild(
                header
            );


            card.appendChild(
                reviewText
            );


            card.appendChild(
                meta
            );


            card.appendChild(
                actions
            );


            list.appendChild(
                card
            );

        }
    );

}


// ============================================================
// APPROVE REVIEW
// ============================================================

async function approveAdminReview(
    reviewId
) {

    if (!db) {
        return;
    }


    const confirmed =
        window.confirm(
            "Approve this review?\n\nIt will become visible on the website."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await db
            .from("reviews")
            .update({

                status:
                    "approved",

                approved_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                reviewId
            );


        if (error) {
            throw error;
        }


        showReviewAdminStatus(
            "Review approved successfully.",
            "success"
        );


        await loadAdminReviews();

    }

    catch (error) {

        console.error(
            "Review approval error:",
            error
        );


        showReviewAdminStatus(
            error.message ||
            "Unable to approve review.",
            "error"
        );

    }

}


// ============================================================
// REJECT REVIEW
// ============================================================

async function rejectAdminReview(
    reviewId
) {

    if (!db) {
        return;
    }


    const confirmed =
        window.confirm(
            "Reject this review?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await db
            .from("reviews")
            .update({

                status:
                    "rejected",

                approved_at:
                    null,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                reviewId
            );


        if (error) {
            throw error;
        }


        showReviewAdminStatus(
            "Review rejected.",
            "success"
        );


        await loadAdminReviews();

    }

    catch (error) {

        console.error(
            "Review rejection error:",
            error
        );


        showReviewAdminStatus(
            error.message ||
            "Unable to reject review.",
            "error"
        );

    }

}


// ============================================================
// DELETE REVIEW
// ============================================================

async function deleteAdminReview(
    reviewId
) {

    if (!db) {
        return;
    }


    const confirmed =
        window.confirm(
            "Delete this review permanently?\n\nThis action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await db
            .from("reviews")
            .delete()
            .eq(
                "id",
                reviewId
            );


        if (error) {
            throw error;
        }


        showReviewAdminStatus(
            "Review deleted successfully.",
            "success"
        );


        await loadAdminReviews();

    }

    catch (error) {

        console.error(
            "Review deletion error:",
            error
        );


        showReviewAdminStatus(
            error.message ||
            "Unable to delete review.",
            "error"
        );

    }

}


// ============================================================
// REVIEW FILTER
// ============================================================

function setReviewAdminFilter(
    filter
) {

    currentReviewFilter =
        filter;


    document
        .querySelectorAll(
            "[data-review-filter]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.reviewFilter ===
                    filter
                );

            }
        );


    renderAdminReviews();

}


// ============================================================
// FORMAT REVIEW DATE
// ============================================================

function formatReviewAdminDate(
    value
) {

    if (!value) {
        return "Unknown";
    }


    try {

        return new Date(
            value
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    catch (error) {

        return value;

    }

}


// ============================================================
// REVIEW STATUS
// ============================================================

function showReviewAdminStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "reviewsAdminStatusMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `status-message ${type}`;


    window.clearTimeout(
        showReviewAdminStatus.timeout
    );


    showReviewAdminStatus.timeout =
        window.setTimeout(
            () => {

                element.textContent =
                    "";

                element.className =
                    "status-message";

            },
            5000
        );

}


// ============================================================
// REVIEW EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const reviewList =
            document.getElementById(
                "reviewsAdminList"
            );


        if (!reviewList) {
            return;
        }


        document
            .querySelectorAll(
                "[data-review-filter]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            setReviewAdminFilter(
                                button.dataset.reviewFilter
                            );

                        }
                    );

                }
            );


        await loadAdminReviews();

    }
);
/* ============================================================
   SPECIAL SESSION BOOKINGS - ADMIN
============================================================= */

(function () {

    let specialSessionBookingFilter =
        "all";


    /* ========================================================
       GET STATUS CLASS
    ========================================================= */

    function getSpecialBookingStatusClass(
        status
    ) {

        if (
            status === "confirmed"
        ) {

            return `
                background:#e8f5e1;
                color:#4d7137;
                padding:5px 10px;
                border-radius:15px;
                font-size:12px;
                font-weight:600;
            `;

        }


        if (
            status === "cancelled"
        ) {

            return `
                background:#fdecec;
                color:#a33a3a;
                padding:5px 10px;
                border-radius:15px;
                font-size:12px;
                font-weight:600;
            `;

        }


        return `
            background:#fff3d6;
            color:#805d18;
            padding:5px 10px;
            border-radius:15px;
            font-size:12px;
            font-weight:600;
        `;

    }


    /* ========================================================
       LOAD BOOKINGS
    ========================================================= */

    async function loadSpecialSessionBookings() {

        const table =
            document.getElementById(
                "specialSessionBookingsTable"
            );


        const loading =
            document.getElementById(
                "specialSessionBookingsLoading"
            );


        const errorElement =
            document.getElementById(
                "specialSessionBookingsError"
            );


        if (!table) {

            return;

        }


        if (
            !window.supabaseClient
        ) {

            console.error(
                "Supabase client not available."
            );

            return;

        }


        loading.style.display =
            "block";


        errorElement.style.display =
            "none";


        try {

            /* =================================================
               GET SPECIAL SESSION BOOKINGS
            ================================================= */

            const {
                data: bookings,
                error
            } = await window.supabaseClient

                .from(
                    "special_session_bookings"
                )

                .select(`
                    id,
                    special_session_id,
                    customer_id,
                    amount,
                    booking_status,
                    payment_status,
                    gateway,
                    created_at
                `)

                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


            if (error) {

                throw error;

            }


            /* =================================================
               GET SESSION IDS
            ================================================= */

            const sessionIds =
                [
                    ...new Set(
                        (bookings || [])
                            .map(
                                booking =>
                                    booking.special_session_id
                            )
                            .filter(
                                Boolean
                            )
                    )
                ];


            /* =================================================
               GET CUSTOMER IDS
            ================================================= */

            const customerIds =
                [
                    ...new Set(
                        (bookings || [])
                            .map(
                                booking =>
                                    booking.customer_id
                            )
                            .filter(
                                Boolean
                            )
                    )
                ];


            /* =================================================
               LOAD SPECIAL SESSIONS
            ================================================= */

            let sessions =
                [];


            if (
                sessionIds.length > 0
            ) {

                const {
                    data,
                    error:
                        sessionError
                } = await window.supabaseClient

                    .from(
                        "special_sessions"
                    )

                    .select(`
                        id,
                        title,
                        session_date,
                        start_time,
                        end_time
                    `)

                    .in(
                        "id",
                        sessionIds
                    );


                if (
                    !sessionError
                ) {

                    sessions =
                        data || [];

                }

            }


            /* =================================================
               LOAD CUSTOMERS
            ================================================= */

            let customers =
                [];


            if (
                customerIds.length > 0
            ) {

                const {
                    data,
                    error:
                        customerError
                } = await window.supabaseClient

                    .from(
                        "customers"
                    )

                    .select(`
                        id,
                        full_name,
                        email,
                        phone
                    `)

                    .in(
                        "id",
                        customerIds
                    );


                if (
                    !customerError
                ) {

                    customers =
                        data || [];

                }

            }


            /* =================================================
               CREATE MAPS
            ================================================= */

            const sessionMap =
                new Map();


            sessions.forEach(
                session => {

                    sessionMap.set(
                        session.id,
                        session
                    );

                }
            );


            const customerMap =
                new Map();


            customers.forEach(
                customer => {

                    customerMap.set(
                        customer.id,
                        customer
                    );

                }
            );


            /* =================================================
               FILTER
            ================================================= */

            let filteredBookings =
                bookings || [];


            if (
                specialSessionBookingFilter !==
                "all"
            ) {

                filteredBookings =
                    filteredBookings.filter(
                        booking =>
                            booking.booking_status ===
                            specialSessionBookingFilter
                    );

            }


            /* =================================================
               EMPTY STATE
            ================================================= */

            if (
                filteredBookings.length ===
                0
            ) {

                table.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            style="
                                padding:30px;
                                text-align:center;
                                color:#777;
                            "
                        >

                            No Special Session bookings
                            found.

                        </td>

                    </tr>

                `;


                loading.style.display =
                    "none";


                return;

            }


            /* =================================================
               CREATE ROWS
            ================================================= */

            table.innerHTML =
                "";


            filteredBookings.forEach(
                booking => {

                    const customer =
                        customerMap.get(
                            booking.customer_id
                        );


                    const session =
                        sessionMap.get(
                            booking.special_session_id
                        );


                    const bookingStatus =
                        booking.booking_status ||
                        "pending";


                    const paymentStatus =
                        booking.payment_status ||
                        "pending";


                    const createdDate =
                        booking.created_at

                            ? new Date(
                                booking.created_at
                            ).toLocaleString(
                                "en-IN"
                            )

                            : "—";


                    const sessionDate =
                        session?.session_date

                            ? new Date(
                                `${session.session_date}T00:00:00`
                            ).toLocaleDateString(
                                "en-IN",
                                {
                                    day:
                                        "2-digit",

                                    month:
                                        "short",

                                    year:
                                        "numeric"
                                }
                            )

                            : "—";


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.style.borderBottom =
                        "1px solid #eee";


                    row.innerHTML = `

                        <td
                            style="
                                padding:13px;
                                font-weight:600;
                            "
                        >

                            #SS-${booking.id}

                        </td>


                        <td
                            style="
                                padding:13px;
                            "
                        >

                            <strong>
                                ${
                                    escapeSpecialAdminHTML(
                                        customer?.full_name ||
                                        "Customer"
                                    )
                                }
                            </strong>

                            <br>

                            <small
                                style="
                                    color:#888;
                                "
                            >
                                ${
                                    escapeSpecialAdminHTML(
                                        customer?.email ||
                                        ""
                                    )
                                }
                            </small>

                        </td>


                        <td
                            style="
                                padding:13px;
                            "
                        >

                            ${
                                escapeSpecialAdminHTML(
                                    session?.title ||
                                    "Special Session"
                                )
                            }

                        </td>


                        <td
                            style="
                                padding:13px;
                            "
                        >

                            ${sessionDate}

                        </td>


                        <td
                            style="
                                padding:13px;
                                font-weight:600;
                            "
                        >

                            ₹${
                                Number(
                                    booking.amount ||
                                    0
                                ).toFixed(2)
                            }

                        </td>


                        <td
                            style="
                                padding:13px;
                            "
                        >

                            <span
                                style="
                                    ${getSpecialBookingStatusClass(
                                        bookingStatus
                                    )}
                                "
                            >

                                ${escapeSpecialAdminHTML(
                                    bookingStatus
                                )}

                            </span>

                        </td>


                        <td
                            style="
                                padding:13px;
                            "
                        >

                            <span
                                style="
                                    ${getSpecialBookingStatusClass(
                                        paymentStatus === "paid"
                                            ? "confirmed"
                                            : paymentStatus === "failed"
                                                ? "cancelled"
                                                : "pending"
                                    )}
                                "
                            >

                                ${escapeSpecialAdminHTML(
                                    paymentStatus
                                )}

                            </span>

                        </td>


                        <td
                            style="
                                padding:13px;
                                color:#777;
                                white-space:nowrap;
                            "
                        >

                            ${createdDate}

                        </td>

                    `;


                    table.appendChild(
                        row
                    );

                }
            );


        }

        catch (error) {

            console.error(
                "Special Session bookings error:",
                error
            );


            errorElement.textContent =
                error.message ||
                "Unable to load Special Session bookings.";


            errorElement.style.display =
                "block";


            table.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        style="
                            padding:30px;
                            text-align:center;
                            color:#a33a3a;
                        "
                    >

                        Unable to load bookings.

                    </td>

                </tr>

            `;

        }

        finally {

            loading.style.display =
                "none";

        }

    }


    /* ========================================================
       HTML ESCAPE
    ========================================================= */

    function escapeSpecialAdminHTML(
        value
    ) {

        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* ========================================================
       FILTER BUTTONS
    ========================================================= */

    function setupSpecialBookingFilters() {

        const buttons =
            document.querySelectorAll(
                ".special-booking-filter"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        buttons.forEach(
                            item => {

                                item.style.background =
                                    "";

                                item.style.color =
                                    "";

                            }
                        );


                        this.style.background =
                            "#596b3d";


                        this.style.color =
                            "#ffffff";


                        specialSessionBookingFilter =
                            this.dataset.filter;


                        loadSpecialSessionBookings();

                    }
                );

            }
        );

    }


    /* ========================================================
       REFRESH BUTTON
    ========================================================= */

    function setupSpecialBookingRefresh() {

        const button =
            document.getElementById(
                "refreshSpecialSessionBookings"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                loadSpecialSessionBookings();

            }
        );

    }


    /* ========================================================
       INITIALIZE
    ========================================================= */

    function initializeSpecialSessionBookings() {

        const section =
            document.getElementById(
                "specialSessionBookingsSection"
            );


        if (!section) {

            return;

        }


        setupSpecialBookingFilters();

        setupSpecialBookingRefresh();

        loadSpecialSessionBookings();

    }


    /* ========================================================
       WAIT FOR PAGE
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSpecialSessionBookings
        );

    }

    else {

        initializeSpecialSessionBookings();

    }


})();
// ============================================================
// START
// ============================================================

(async function initializeAdminServices() {

    const authorized =
        await checkAdmin();


    if (!authorized) {
        return;
    }


    await loadServices();

})();