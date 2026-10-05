import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { calendarDates, calendarPayload, choreDue, dayDate, duplicateEvent, eventLayout, eventsOnDay, fraction, iso, localeName, mergeIngredients, moveDate, nextBirthday, occurrences, organizerRoute, parseIngredients, presetCapability, resolveGroceryList, serializeIngredients, shift, unsupportedRecurrence, weekStart, weekStartIndex, type Item } from "./helpers";
import { panelStyles } from "./styles";

type Hass = {
  user?: { id: string; is_admin: boolean };
  locale?: { language?: string };
  themes?: { darkMode?: boolean };
  callWS<T>(message: Item): Promise<T>;
  fetchWithAuth(path: string, init?: RequestInit): Promise<Response>;
  connection: { subscribeMessage(cb: () => void, message: Item): Promise<() => void> };
};
type Editor = { kind: string; item: Item; resource?: string; collection?: string };
type BirthdayRow = { person: Item; next: ReturnType<typeof nextBirthday> };
const resources = ["people", "calendar", "groceries", "todos", "chores", "recipes", "journal", "contacts", "settings"];
const capabilities = ["manage_people", "manage_calendar_all", "manage_calendar_own", "manage_groceries", "manage_todos", "manage_meal_plan", "manage_chores", "complete_own_chores", "complete_any_chore", "manage_recipes", "manage_journal", "manage_contacts", "manage_settings", "manage_calendar_sync"];
const pages = [
  { id: "today", name: "Today", icon: "☀", subtitle: "Everything your family has going on, at a glance." },
  { id: "calendar", name: "Calendar", icon: "▦", subtitle: "A little less juggling. A little more together." },
  { id: "groceries", name: "Shopping", icon: "▤", subtitle: "From the weekly plan to the shopping basket." },
  { id: "todos", name: "To Do", icon: "☑", subtitle: "Lists for everything that isn’t groceries." },
  { id: "recipes", name: "Meals", icon: "♧", subtitle: "Good food worth making again." },
  { id: "chores", name: "Chores", icon: "✓", subtitle: "Small contributions. A happier home." },
  { id: "journal", name: "Journal", icon: "✎", subtitle: "Capture the little moments worth remembering." },
  { id: "birthdays", name: "Birthdays", icon: "♡", subtitle: "Never miss a chance to celebrate." },
  { id: "contacts", name: "Contacts", icon: "☎", subtitle: "The people who keep your family running." },
  { id: "settings", name: "Settings", icon: "⚙", subtitle: "Make your organizer feel like home." },
];
const i18n: Record<string, Record<string, string>> = {
  en: {
    settings: "Settings", shopping: "Shopping", lock: "Lock", unlock_title: "Unlock Family Organizer", unlock_text: "Choose your family profile and enter your PIN.", family_member: "Family member", pin: "PIN", unlock: "Unlock", retry: "Retry", try_again: "Try again", getting_together: "Getting your family together…", loading_copy: "Loading your calendar, lists and favorite recipes.",
    save: "Save", cancel: "Cancel", close_dialog: "Close dialog", delete: "Delete", saving: "Saving…", saving_changes: "Saving your changes…", yes: "Yes", no: "No",
    skip_content: "Skip to content", quick_add: "Quick add", family_sync: "YOUR FAMILY, IN SYNC", our_people: "OUR PEOPLE", family_starts: "Your family starts here.", made_together: "Made for everyday together.",
    could_not_load: "Couldn’t load your organizer", check_connection_permissions: "Check your connection and family permissions.", calendar_exported: "Calendar exported. Import the .ics file into any calendar app.", could_not_export_calendar: "Could not export the calendar", recipe_not_found: "Recipe not found", recipe_missing_access: "It may have been deleted or is no longer shared with you.", all_recipes: "All recipes", view_only: "You have a view-only account", ask_admin_permissions: "Ask a family administrator to adjust your permissions.",
    open_ha_navigation: "Open Home Assistant navigation", ha_menu: "HA menu", home_assistant: "Home Assistant",
    role_parent: "Parent", role_child: "Child", role_admin: "Family administrator", permission_overrides: "permission overrides", ha_linked: "HA account linked", ha_not_linked: "No HA account linked", unassigned: "Unassigned", unknown_error: "Unexpected error",
  },
  nl: {
    settings: "Instellingen", shopping: "Boodschappen", lock: "Vergrendel", unlock_title: "Ontgrendel Family Organizer", unlock_text: "Kies je familieprofiel en voer je pincode in.", family_member: "Familielid", pin: "Pincode", unlock: "Ontgrendelen", retry: "Opnieuw", try_again: "Probeer opnieuw", getting_together: "Familieoverzicht laden…", loading_copy: "Je agenda, lijsten en recepten worden geladen.",
    save: "Opslaan", cancel: "Annuleren", close_dialog: "Dialoog sluiten", delete: "Verwijderen", saving: "Opslaan…", saving_changes: "Wijzigingen worden opgeslagen…", yes: "Ja", no: "Nee",
    skip_content: "Ga naar inhoud", quick_add: "Snel toevoegen", family_sync: "JULLIE GEZIN, IN SYNC", our_people: "ONZE MENSEN", family_starts: "Jullie gezin begint hier.", made_together: "Gemaakt voor elke dag samen.",
    could_not_load: "Organizer kon niet worden geladen", check_connection_permissions: "Controleer je verbinding en gezinsrechten.", calendar_exported: "Agenda geëxporteerd. Importeer het .ics-bestand in je agenda-app.", could_not_export_calendar: "Kon de agenda niet exporteren", recipe_not_found: "Recept niet gevonden", recipe_missing_access: "Het recept is verwijderd of niet meer met je gedeeld.", all_recipes: "Alle recepten", view_only: "Je account heeft alleen-lezen toegang", ask_admin_permissions: "Vraag een gezinsbeheerder om je rechten aan te passen.",
    open_ha_navigation: "Open Home Assistant-navigatie", ha_menu: "HA-menu", home_assistant: "Home Assistant",
    role_parent: "Ouder", role_child: "Kind", role_admin: "Gezinsbeheerder", permission_overrides: "rechten aangepast", ha_linked: "HA-account gekoppeld", ha_not_linked: "Geen HA-account gekoppeld", unassigned: "Niet toegewezen", unknown_error: "Onverwachte fout",
  },
};
const i18nMessages: Record<string, Record<string, string>> = {
  en: {},
  nl: {
    "This recipe link is malformed. Showing your cookbook instead.": "Deze receptenlink is ongeldig. Je kookboek wordt getoond.",
    "Enter a 4 to 8 digit PIN.": "Voer een pincode van 4 tot 8 cijfers in.",
    "Incorrect PIN": "Onjuiste pincode",
    "This family member has no PIN yet": "Dit familielid heeft nog geen pincode",
    "User is not linked to a family person": "Gebruiker is niet gekoppeld aan een familielid",
    "Home Assistant user is already linked": "Deze Home Assistant-gebruiker is al gekoppeld",
    "The event must end after it starts.": "De afspraak moet eindigen na de start.",
    "Choose at least one weekday.": "Kies minimaal één weekdag.",
    "Choose a recipe or enter a meal name.": "Kies een recept of voer een maaltijdnaam in.",
    "That meal slot is already planned. Edit it from the planner instead.": "Dit maaltijdslot is al ingepland. Bewerk het vanuit de planner.",
    "Enter at least one meal slot.": "Kies minimaal één maaltijdslot.",
    "Enter a valid language code, such as en, de or fr.": "Kies een geldige taalcode, zoals en of nl.",
    "Could not download the page": "Kon de pagina niet downloaden",
    "No recipe data was found on that page. Try copying it in manually.": "Er is geen receptdata gevonden op die pagina. Voeg het recept handmatig toe.",
  },
};
const nlStrings: Record<string, string> = {
  // Shared
  "Saved": "Opgeslagen", "Edit": "Bewerken", "Delete": "Verwijderen", "Remove": "Verwijderen", "Anyone": "Iedereen", "Everyone": "Iedereen", "Family member": "Familielid", "Family members": "Familieleden", "Notes": "Notities", "Name": "Naam", "Date": "Datum", "Title": "Titel", "Description": "Omschrijving", "Assigned to": "Toegewezen aan", "Share with the family": "Delen met het gezin", "All day": "Hele dag", "Not planned": "Niet gepland", "Done ✓": "Klaar ✓", "pts": "ptn", "servings": "porties", "more": "meer", "Main navigation": "Hoofdnavigatie", "Mobile navigation": "Mobiele navigatie", "Dismiss notification": "Melding sluiten",
  "people. One shared home.": "mensen. Eén gedeeld thuis.", "Welcome": "Welkom",
  "Copy from Home Assistant user": "Kopiëren van Home Assistant-gebruiker", "Don’t link a Home Assistant user": "Geen Home Assistant-gebruiker koppelen",
  "Keep profile picture in sync with Home Assistant": "Profielfoto synchroon houden met Home Assistant",
  "Only users that aren’t linked to another family member are listed. The name and profile picture are copied over.": "Alleen gebruikers die nog niet aan een ander familielid zijn gekoppeld worden getoond. De naam en profielfoto worden overgenomen.",
  // Groceries
  "SHOPPING LIST": "BOODSCHAPPENLIJST", "Groceries": "Boodschappen", "to buy": "te kopen", "in the basket": "in de mand", "Add item": "Item toevoegen", "Grocery lists": "Boodschappenlijsten", "Group by store": "Groeperen op winkel", "Clear bought": "Gekochte wissen", "Bought items cleared": "Gekochte items gewist", "No store": "Geen winkel", "Moved back to your list": "Terug op je lijst gezet", "Added to the basket": "In de mand gelegd", "A fresh start": "Een frisse start", "No items assigned to this person.": "Geen items toegewezen aan deze persoon.", "Add an item or send ingredients from a recipe.": "Voeg een item toe of stuur ingrediënten vanuit een recept.", "Add your first item": "Voeg je eerste item toe", "A LITTLE ORGANIZATION": "EEN BEETJE ORDE", "One list for every stop": "Eén lijst voor elke winkel", "Keep the supermarket, farmers’ market and pantry runs separate. Matching items merge automatically.": "Houd supermarkt, markt en voorraadkast gescheiden. Gelijke items worden automatisch samengevoegd.", "New list": "Nieuwe lijst", "Edit list": "Lijst bewerken", "Delete list": "Lijst verwijderen", "Deleting a list also removes its grocery items. Keep at least one list.": "Als je een lijst verwijdert, verdwijnen ook de items. Houd minimaal één lijst.", "What’s cooking?": "Wat eten we?", "Plan the week and shop recipe ingredients straight into this list.": "Plan de week en zet receptingrediënten direct op deze lijst.", "Meal planner & recipes →": "Maaltijdplanner & recepten →", "Mark": "Markeer", "bought": "gekocht", "Created by": "Gemaakt door", "a family member": "een familielid",
  // Meal planner
  "LESS “WHAT’S FOR DINNER?”": "MINDER “WAT ETEN WE VANAVOND?”", "Your weekly meal plan": "Jullie weekmenu", "Previous meal week": "Vorige maaltijdweek", "Next meal week": "Volgende maaltijdweek", "This week": "Deze week", "Recipe →": "Recept →", "Plan meal": "Maaltijd plannen", "Plan": "Plan", "on": "op", "from": "van", "breakfast": "ontbijt", "lunch": "lunch", "dinner": "diner",
  // Chores
  "Score period": "Scoreperiode", "This month": "Deze maand",
  // Recipes
  "THE FAMILY COOKBOOK": "HET GEZINSKOOKBOEK", "Favorites, all in one place": "Favorieten, allemaal op één plek", "Import from web": "Importeren van internet", "New recipe": "Nieuw recept", "Search recipes or tags": "Zoek recepten of tags", "Search recipes or tags…": "Zoek recepten of tags…", "Category": "Categorie", "All categories": "Alle categorieën", "Manage categories": "Categorieën beheren", "FROM OUR KITCHEN": "UIT ONZE KEUKEN", "Family favorite": "Gezinsfavoriet", "min": "min", "No recipes match": "Geen recepten gevonden", "Start your family cookbook": "Begin jullie gezinskookboek", "Save a favorite recipe, scale its servings and send ingredients to your lists.": "Bewaar een favoriet recept, pas de porties aan en stuur ingrediënten naar je lijsten.", "Add a recipe": "Recept toevoegen", "All recipes": "Alle recepten", "Edit recipe": "Recept bewerken", "FROM THE FAMILY COOKBOOK": "UIT HET GEZINSKOOKBOEK", "Prep": "Voorbereiding", "Cook": "Bereiding", "Plan this meal": "Deze maaltijd plannen", "Ingredients": "Ingrediënten", "Decrease servings": "Minder porties", "Increase servings": "Meer porties", "Servings": "Porties", "automatically scaled from": "automatisch omgerekend vanaf", "Check ingredients to send to your grocery lists.": "Vink ingrediënten aan om ze naar je boodschappenlijsten te sturen.", "List for": "Lijst voor", "ingredients sent to your grocery lists": "ingrediënten naar je boodschappenlijsten gestuurd", "Add selected to groceries": "Selectie aan boodschappen toevoegen", "LET’S MAKE SOMETHING GOOD": "LATEN WE IETS LEKKERS MAKEN", "Method": "Bereidingswijze", "No instructions yet. Edit this recipe to add the method.": "Nog geen bereidingswijze. Bewerk dit recept om stappen toe te voegen.", "New category": "Nieuwe categorie",
  // Today
  "Good morning": "Goedemorgen", "Good afternoon": "Goedemiddag", "Good evening": "Goedenavond", "A quiet calendar": "Een rustige agenda", "event": "afspraak", "events": "afspraken", "chore": "klus", "chores": "klussen", "to do": "te doen", "turns": "wordt", "soon turns": "wordt binnenkort", "another year": "een jaar ouder", "today 🎉": "vandaag 🎉", "in": "over", "day": "dag", "days": "dagen", "TODAY’S AGENDA": "AGENDA VAN VANDAAG", "Calendar": "Agenda", "Open calendar →": "Agenda openen →", "Nothing scheduled today.": "Niets gepland vandaag.", "COMING UP": "BINNENKORT", "Add an event": "Afspraak toevoegen", "WHAT’S FOR DINNER?": "WAT ETEN WE VANAVOND?", "Meals": "Maaltijden", "Meal planner →": "Maaltijdplanner →", "SHOPPING": "BOODSCHAPPEN", "Shopping lists →": "Boodschappenlijsten →", "TO DO": "TAKEN", "open": "open", "To-do lists →": "Takenlijsten →", "Nice, one less thing": "Mooi, weer één minder", "Add to-do": "Taak toevoegen", "CHORES": "KLUSSEN", "Chore board →": "Klussenbord →", "No chores due today.": "Geen klussen voor vandaag.", "FAMILY JOURNAL": "GEZINSDAGBOEK", "Latest moment": "Laatste moment", "Journal →": "Dagboek →", "Write down something worth remembering.": "Schrijf iets op dat je wilt onthouden.", "New entry": "Nieuw item",
  // Todos
  "Need groceries instead?": "Toch boodschappen nodig?",
  // Journal
  "Record first words, big wins and ordinary days you don’t want to forget.": "Leg eerste woordjes, grote overwinningen en gewone dagen vast die je niet wilt vergeten.", "No entries for this family member yet.": "Nog geen items voor dit familielid.", "Write the first entry": "Schrijf het eerste item",
  // Contacts
  "Other": "Overig", "No matches": "Geen resultaten", "Keep everyone close": "Houd iedereen dichtbij", "Try a different search.": "Probeer een andere zoekopdracht.", "Babysitters, school, the dentist, grandparents: one shared place for every number.": "Oppas, school, de tandarts, opa en oma: één gedeelde plek voor elk nummer.", "Add the first contact": "Voeg het eerste contact toe",
  // Birthdays
  "CELEBRATE TOGETHER": "SAMEN VIEREN", "Upcoming birthdays": "Aankomende verjaardagen", "Add a person": "Persoon toevoegen", "Today 🎉": "Vandaag 🎉", "Tomorrow": "Morgen", "No birthdays yet": "Nog geen verjaardagen", "Add a birthday to each family member in Settings and we’ll count down for you.": "Voeg bij Instellingen een verjaardag toe aan elk familielid en wij tellen af.", "Family members without a birthday": "Familieleden zonder verjaardag", "Add birthday": "Verjaardag toevoegen",
  // Dialog
  "FAMILY ORGANIZER": "FAMILY ORGANIZER", "Calendar event": "Agenda-afspraak", "Make time for what matters": "Maak tijd voor wat belangrijk is", "Shopping item": "Boodschap", "Remember it before you forget it": "Noteer het voor je het vergeet", "To-do": "Taak", "Get it off your mind and onto the list": "Uit je hoofd, op de lijst", "Planned meal": "Geplande maaltijd", "Give dinner a little direction": "Geef het avondeten richting", "Family chore": "Gezinsklus", "Share the load, celebrate the effort": "Verdeel het werk, vier de inzet", "Favorite recipe": "Favoriet recept", "Keep a good thing close": "Bewaar wat lekker is", "Journal entry": "Dagboekitem", "Save a moment worth remembering": "Bewaar een moment om te onthouden", "Contact": "Contact", "A number the whole family can find": "Een nummer dat het hele gezin kan vinden",
  "All to-dos on this list will also be removed.": "Alle taken op deze lijst worden ook verwijderd.", "All grocery items on this list will also be removed.": "Alle boodschappen op deze lijst worden ook verwijderd.", "Recipes are kept. Child categories move to the parent.": "Recepten blijven bewaard. Subcategorieën gaan naar de bovenliggende categorie.", "This removes the entire repeating event series.": "Hiermee verwijder je de hele herhalende reeks.", "This cannot be undone.": "Dit kan niet ongedaan worden gemaakt.", "this item": "dit item",
  // Event form
  "Does not repeat": "Herhaalt niet", "Every day": "Elke dag", "Every week": "Elke week", "Every month": "Elke maand", "Every year": "Elk jaar", "Keep existing:": "Huidige behouden:", "Event title": "Titel afspraak", "Location": "Locatie", "Starts on": "Begint op", "Ends on (inclusive for all-day)": "Eindigt op (inclusief bij hele dag)", "Start time": "Starttijd", "End time": "Eindtijd", "All-day event (time fields are ignored)": "Hele dag (tijden worden genegeerd)", "Repeat": "Herhalen", "Reminder": "Herinnering", "Family default": "Gezinsstandaard", "No reminder": "Geen herinnering", "At start": "Bij aanvang", "5 minutes before": "5 minuten vooraf", "15 minutes before": "15 minuten vooraf", "30 minutes before": "30 minuten vooraf", "1 hour before": "1 uur vooraf", "2 hours before": "2 uur vooraf", "1 day before": "1 dag vooraf",
  // Grocery / list / todo forms
  "Item name": "Naam item", "Quantity": "Aantal", "Unit": "Eenheid", "cups, kg, packs…": "stuks, kg, pakken…", "Grocery list": "Boodschappenlijst", "Store": "Winkel", "List name": "Naam lijst", "Default store": "Standaardwinkel", "What needs doing?": "Wat moet er gebeuren?", "List": "Lijst", "Due date": "Deadline",
  // Recipe import / contact / journal forms
  "Recipe page URL": "URL van de receptpagina", "We read the recipe details most cooking sites publish, then let you review before saving.": "We lezen de receptgegevens die de meeste kooksites publiceren en laten je alles controleren voordat je opslaat.", "Group": "Groep", "School, Doctors, Family, Friends…": "School, Artsen, Familie, Vrienden…", "Phone numbers (one per line)": "Telefoonnummers (één per regel)", "Email addresses (one per line)": "E-mailadressen (één per regel)", "Address": "Adres", "Opening hours, who to ask for…": "Openingstijden, naar wie je vraagt…", "What happened?": "Wat is er gebeurd?", "First steps, a big win, a funny thing someone said…": "Eerste stapjes, een grote overwinning, iets grappigs dat iemand zei…", "Photo URLs (one per line)": "Foto-URL’s (één per regel)",
  // Meal / chore / points forms
  "Meal slot": "Maaltijdvak", "Choose a recipe": "Kies een recept", "Use a meal name instead": "Gebruik een maaltijdnaam", "Meal name (if not using a recipe)": "Naam maaltijd (zonder recept)", "Chore title": "Titel klus", "Points": "Punten", "Icon (MDI name)": "Icoon (MDI-naam)", "Schedule": "Planning", "One time": "Eenmalig", "Daily": "Dagelijks", "Weekly": "Wekelijks", "Monthly": "Maandelijks", "Custom interval": "Aangepast interval", "Keep existing weekdays": "Huidige weekdagen behouden", "Rotate between assignees after each completion": "Wissel na elke afronding van persoon", "Weekdays (weekly schedule)": "Weekdagen (wekelijkse planning)", "Day of month (monthly)": "Dag van de maand (maandelijks)", "Every N days (custom)": "Elke N dagen (aangepast)", "Due date (one time)": "Deadline (eenmalig)", "Due time": "Tijdstip", "Points (negative to subtract)": "Punten (negatief om af te trekken)", "Reason": "Reden",
  // Recipe / category / person forms
  "Recipe title": "Titel recept", "Tags (comma separated)": "Tags (gescheiden door komma’s)", "Image URL": "Afbeeldings-URL", "Base servings": "Basisporties", "Prep time (minutes)": "Voorbereidingstijd (minuten)", "Cook time (minutes)": "Bereidingstijd (minuten)", "Categories": "Categorieën", "Ingredients (one per line: quantity, optional unit, name)": "Ingrediënten (één per regel: hoeveelheid, eventueel eenheid, naam)", "Method (one step per line)": "Bereidingswijze (één stap per regel)", "Category name": "Naam categorie", "Parent category": "Bovenliggende categorie", "Root category": "Hoofdcategorie", "Family color": "Gezinskleur", "Home Assistant user ID": "Home Assistant-gebruikers-ID", "Profile picture URL": "URL profielfoto", "Birthday": "Verjaardag", "Role preset": "Rol", "Parent (all rights)": "Ouder (alle rechten)", "Child (limited rights)": "Kind (beperkte rechten)", "PIN code (4-8 digits)": "Pincode (4-8 cijfers)", "Enter new PIN to change": "Voer een nieuwe pincode in om te wijzigen", "Set a PIN": "Stel een pincode in", "Remove existing PIN for this family member": "Bestaande pincode van dit familielid verwijderen", "The user ID links this person’s Home Assistant account. Permission overrides take priority over their role preset.": "Het gebruikers-ID koppelt het Home Assistant-account van deze persoon. Aangepaste rechten gaan vóór de rol.", "Permission overrides": "Aangepaste rechten", "Use role preset": "Volg rol", "Allow": "Toestaan", "Deny": "Weigeren",
  // Preferences form
  "Appearance default": "Standaarduiterlijk", "Follow Home Assistant": "Volg Home Assistant", "Light": "Licht", "Dark": "Donker", "Day overview position": "Positie dagoverzicht", "Left": "Links", "Right": "Rechts", "Collapse day overview by default": "Dagoverzicht standaard inklappen", "Week starts": "Week begint op", "Monday": "Maandag", "Sunday": "Zondag", "Time format": "Tijdnotatie", "24 hour": "24 uur", "12 hour": "12 uur", "Default calendar view": "Standaard agendaweergave", "Month": "Maand", "Week": "Week", "Day": "Dag", "Grocery default": "Standaard boodschappenlijst", "Weekly groceries": "Wekelijkse boodschappen", "Daily groceries": "Dagelijkse boodschappen", "Random list": "Willekeurige lijst", "Meal slots": "Maaltijdvakken", "Breakfast": "Ontbijt", "Lunch": "Lunch", "Dinner": "Diner", "Stores (comma separated)": "Winkels (gescheiden door komma’s)", "Competition default": "Standaard competitie", "Language": "Taal", "Calendar sync interval (minutes)": "Synchronisatie-interval agenda (minuten)", "Send event reminders": "Herinneringen voor afspraken sturen", "Default reminder (minutes before)": "Standaardherinnering (minuten vooraf)", "Notify service (e.g. mobile_app_phone)": "Notificatiedienst (bijv. mobile_app_phone)", "Leave empty for Home Assistant notifications": "Laat leeg voor Home Assistant-meldingen", "Daily agenda time (optional)": "Tijd dagelijkse agenda (optioneel)",
  // Permission capability labels
  "manage people": "personen beheren", "manage calendar all": "hele agenda beheren", "manage calendar own": "eigen agenda beheren", "manage groceries": "boodschappen beheren", "manage todos": "taken beheren", "manage meal plan": "maaltijdplanning beheren", "manage chores": "klussen beheren", "complete own chores": "eigen klussen afronden", "complete any chore": "alle klussen afronden", "manage recipes": "recepten beheren", "manage journal": "dagboek beheren", "manage contacts": "contacten beheren", "manage settings": "instellingen beheren", "manage calendar sync": "agendasynchronisatie beheren",
};
const pageText: Record<string, { en: [string, string]; nl: [string, string] }> = {
  today: { en: ["Today", "Everything your family has going on, at a glance."], nl: ["Vandaag", "Alles wat je gezin gepland heeft, in één oogopslag."] },
  calendar: { en: ["Calendar", "A little less juggling. A little more together."], nl: ["Agenda", "Minder gedoe. Meer samen."] },
  groceries: { en: ["Shopping", "From the weekly plan to the shopping basket."], nl: ["Boodschappen", "Van weekplanning naar boodschappenmand."] },
  todos: { en: ["To Do", "Lists for everything that isn’t groceries."], nl: ["Taken", "Lijstjes voor alles behalve boodschappen."] },
  recipes: { en: ["Meals", "Good food worth making again."], nl: ["Maaltijden", "Lekkere recepten om vaker te maken."] },
  chores: { en: ["Chores", "Small contributions. A happier home."], nl: ["Klussen", "Kleine bijdragen, een fijner thuis."] },
  journal: { en: ["Journal", "Capture the little moments worth remembering."], nl: ["Dagboek", "Leg kleine momenten vast die je wilt onthouden."] },
  birthdays: { en: ["Birthdays", "Never miss a chance to celebrate."], nl: ["Verjaardagen", "Mis nooit een moment om te vieren."] },
  contacts: { en: ["Contacts", "The people who keep your family running."], nl: ["Contacten", "De mensen die je gezin draaiende houden."] },
  settings: { en: ["Settings", "Make your organizer feel like home."], nl: ["Instellingen", "Maak je organizer helemaal van jullie."] },
};

@customElement("family-organizer-panel")
export class FamilyOrganizerPanel extends LitElement {
  @state() private page = "today";
  @state() private data: Record<string, Item> = {};
  @state() private selectedDay = iso(new Date());
  @state() private calendarView = "list";
  @state() private personFilter = new Set<string>();
  @state() private listId = "default";
  @state() private todoListId = "default";
  @state() private showDoneTodos = false;
  @state() private journalPerson = "";
  @state() private contactQuery = "";
  @state() private groceryAssignee = "";
  @state() private groupStores = false;
  @state() private mealWeek = 0;
  @state() private scorePeriod = "week";
  @state() private recipeSearch = "";
  @state() private recipeCategory = "";
  @state() private recipeId = "";
  @state() private servings: Record<string, number> = {};
  @state() private selectedIngredients: Record<string, Set<number>> = {};
  @state() private routes: Record<string, Record<string, string>> = {};
  @state() private theme = localStorage.getItem("family-organizer-theme") || "auto";
  @state() private error = "";
  @state() private notice = "";
  @state() private pinPersonId = localStorage.getItem("family-organizer-person-id") || "";
  @state() private pinCapabilites?: Record<string, boolean>;
  @state() private locked = false;
  @state() private loading = true;
  @state() private saving = false;
  @state() private editor?: Editor;
  @state() private haUsers: Item[] = [];
  @state() private calendarSearch = "";
  private _hass?: Hass;
  private unsubscribe?: () => void;
  private subscribing = false;
  private initialized = false;
  private loadSequence = 0;
  private returnFocus?: HTMLElement;
  private localOverview?: boolean;

  set hass(value: Hass) {
    const first = !this._hass;
    this._hass = value;
    if (first) void this.load();
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("hashchange", this.readRoute);
    this.readRoute();
    if (this._hass) void this.load();
  }
  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    window.removeEventListener("hashchange", this.readRoute);
    super.disconnectedCallback();
  }
  private readRoute = () => {
    const route = organizerRoute(location.hash);
    if (route) {
      this.page = route.page; this.recipeId = route.recipeId;
      if (route.malformed) this.notice = this.tm("This recipe link is malformed. Showing your cookbook instead.");
    }
  };
  private navigate(page: string, id = "") {
    this.page = page; this.recipeId = id;
    location.hash = `fo/${page}${id ? `/${encodeURIComponent(id)}` : ""}`;
  }
  private get settingsData() { return this.data.settings || {}; }
  private get languageCode() { return this.settingsData.language === "nl" ? "nl" : "en"; }
  private t(key: string) { return i18n[this.languageCode][key] || i18n.en[key] || key; }
  private s(en: string, nl: string) { return this.languageCode === "nl" ? nl : en; }
  private x(en: string) { return this.languageCode === "nl" ? nlStrings[en] ?? en : en; }
  private tm(message: string) {
    if (!message) return message;
    const table = i18nMessages[this.languageCode] || {};
    if (table[message]) return table[message];
    for (const [source, translated] of Object.entries(table)) {
      if (message.includes(source)) return message.replace(source, translated);
    }
    return message;
  }
  private pageName(id: string, fallback: string) { return pageText[id]?.[this.languageCode]?.[0] || fallback; }
  private pageSubtitle(id: string, fallback: string) { return pageText[id]?.[this.languageCode]?.[1] || fallback; }
  private get people() { return this.data.people?.items || []; }
  private get locale() { return localeName(this.settingsData.language || this._hass?.locale?.language); }
  private get firstDay() { return weekStartIndex(this.settingsData.week_start, this.locale); }
  private get me() {
    if (this.pinPersonId) return this.people.find((p: Item) => p.id === this.pinPersonId) || this.people.find((p: Item) => p.id === this.settingsData.current_user?.person_id);
    if (this.settingsData.current_user) return this.people.find((p: Item) => p.id === this.settingsData.current_user.person_id);
    const userId = this._hass?.user?.id;
    return userId ? this.people.find((p: Item) => (p.user_id || p.ha_user_id) === userId) : undefined;
  }
  private can(capability: string) {
    const local = this.pinCapabilites?.[capability];
    if (this.locked) return false;
    if (typeof local === "boolean") return local;
    const authoritative = this.settingsData.current_user?.capabilities?.[capability];
    if (typeof authoritative === "boolean") return authoritative;
    if (this._hass?.user?.is_admin) return true;
    const person = this.me;
    return person ? person.permissions?.[capability] ?? presetCapability(person.role, capability) : false;
  }
  private canEvent(item?: Item) {
    return this.can("manage_calendar_all") || (this.can("manage_calendar_own") && (!item || (item.person_ids || []).includes(this.me?.id) || [this.me?.id, this._hass?.user?.id].includes(item.creator_id)));
  }
  private person(id?: string) { return this.people.find((p: Item) => p.id === id); }
  private avatar(id?: string) {
    const person = this.person(id), picture = person?.profile_picture || person?.avatar_url;
    return picture ? html`<img class="avatar" src=${picture} alt=${person.name} style=${`--person-color:${this.color(person?.color)}`} loading="lazy" referrerpolicy="no-referrer">`
      : html`<span class="avatar fallback" style=${`--person-color:${this.color(person?.color)}`} aria-label=${person?.name || this.t("unassigned")}>${person?.initials || person?.name?.split(/\s+/).map((x: string) => x[0]).join("").slice(0, 2).toUpperCase() || "?"}</span>`;
  }
  private color(value?: string) { return /^#[0-9a-f]{3,8}$/i.test(value || "") ? value! : "#64748b"; }
  private date(day: string, options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }) { return dayDate(day).toLocaleDateString(this.locale, options); }
  private time(value: string) { return new Date(value).toLocaleTimeString(this.locale, { hour: "numeric", minute: "2-digit", hour12: this.settingsData.time_format === "12" }); }
  private peopleOptions(selected?: string) { return this.people.map((p: Item) => html`<option value=${p.id} ?selected=${p.id === selected}>${p.name}</option>`); }
  private groceryDefaultLabel(value?: string) {
    const fixed: Record<string, string> = { weekly: this.s("Weekly groceries", "Wekelijkse boodschappen"), daily: this.s("Daily groceries", "Dagelijkse boodschappen"), random: this.s("Random list", "Willekeurige lijst") };
    return fixed[value || ""] || (this.data.groceries?.lists || []).find((x: Item) => x.id === value)?.name || this.s("First list", "Eerste lijst");
  }
  private async load() {
    if (!this._hass) return;
    const sequence = ++this.loadSequence;
    try {
      const values = await Promise.all(resources.map(resource => this._hass!.callWS<Item>({ type: "family_organizer/list", resource })));
      if (sequence !== this.loadSequence) return;
      this.data = Object.fromEntries(resources.map((resource, i) => [resource, values[i]]));
      const settings = this.settingsData;
      this.listId = resolveGroceryList(this.data.groceries.lists || [], this.listId, settings.default_grocery_list_id, !this.initialized);
      this.todoListId = resolveGroceryList(this.data.todos?.lists || [], this.todoListId);
      if (!this.initialized) {
        this.calendarView = settings.default_calendar_view || "list";
        this.scorePeriod = settings.competition_default || "week";
        this.theme = localStorage.getItem("family-organizer-theme") || settings.theme || "auto";
        this.initialized = true;
      }
      this.error = "";
      if (!this.pinPersonId) this.pinPersonId = this.settingsData.current_user?.person_id || "";
      this.locked = !!this.pinPersonId && !!this.people.find((p: Item) => p.id === this.pinPersonId && p.has_pin);
      if (!this.unsubscribe && !this.subscribing && this.isConnected) {
        this.subscribing = true;
        try {
          const unsubscribe = await this._hass.connection.subscribeMessage(() => void this.load(), { type: "family_organizer/subscribe" });
          if (this.isConnected) this.unsubscribe = unsubscribe; else unsubscribe();
        } finally { this.subscribing = false; }
      }
    } catch (error) { if (sequence === this.loadSequence) this.error = this.message(error); }
    finally { if (sequence === this.loadSequence) this.loading = false; }
  }
  private message(error: unknown) { return this.tm((error as Item)?.message || String(error) || this.t("unknown_error")); }
  private async verifyPin(event: SubmitEvent) {
    event.preventDefault();
    if (!this._hass || !this.pinPersonId) return;
    const form = event.currentTarget as HTMLFormElement;
    const pin = String(new FormData(form).get("pin") || "").trim();
    if (!/^\d{4,8}$/.test(pin)) { this.error = this.tm("Enter a 4 to 8 digit PIN."); return; }
    this.error = "";
    this.saving = true;
    try {
      const result = await this._hass.callWS<Item>({ type: "family_organizer/verify_pin", person_id: this.pinPersonId, pin });
      this.pinCapabilites = result.capabilities || {};
      this.locked = false;
      localStorage.setItem("family-organizer-person-id", this.pinPersonId);
      this.notice = `${this.x("Welcome")} ${result.name || ""}`.trim();
    } catch (error) { this.error = this.message(error); }
    finally { this.saving = false; }
  }
  private switchProfile(id: string) {
    this.pinPersonId = id;
    this.pinCapabilites = undefined;
    localStorage.setItem("family-organizer-person-id", id || "");
    const person = this.people.find((p: Item) => p.id === id);
    this.locked = !!person?.has_pin;
  }
  private lockScreen() {
    this.pinCapabilites = undefined;
    this.locked = true;
  }
  private async action(work: () => Promise<unknown>, success = "Saved", close = false) {
    if (this.saving) return false;
    this.saving = true; this.error = ""; this.notice = "";
    try {
      await work();
      await this.load();
      this.notice = this.x(success);
      if (close) this.closeEditor(true);
      return true;
    } catch (error) { this.error = this.message(error); return false; }
    finally { this.saving = false; }
  }
  private mutate(resource: string, item: Item, collection = "items") {
    const payload = resource === "calendar" && collection === "items" ? calendarPayload(item) : item;
    return this._hass!.callWS({ type: `family_organizer/${item.id ? "update" : "create"}`, resource, collection, ...(item.id ? { item_id: item.id } : {}), item: payload });
  }
  private confirmDelete(resource: string, item: Item, collection = "items") {
    this.openEditor("delete", item, resource, collection);
  }
  private openEditor(kind: string, item: Item = {}, resource?: string, collection?: string) {
    if (this.saving) return;
    if (!this.editor) this.returnFocus = (this.renderRoot as ShadowRoot).activeElement as HTMLElement;
    this.error = "";
    this.editor = { kind, item: { ...item }, resource, collection };
    if (kind === "person") void this.loadHaUsers();
    void this.updateComplete.then(() => {
      const dialog = this.renderRoot.querySelector("dialog") as HTMLDialogElement;
      if (!dialog.open) dialog.showModal();
      (dialog.querySelector("[autofocus]") as HTMLElement || dialog.querySelector("input,select,button") as HTMLElement)?.focus();
    });
  }
  private closeEditor(force = false) {
    if (this.saving && !force) return;
    (this.renderRoot.querySelector("dialog") as HTMLDialogElement)?.close();
    this.editor = undefined;
    void this.updateComplete.then(() => this.returnFocus?.isConnected ? this.returnFocus.focus() : (this.renderRoot.querySelector(".quick-add") as HTMLElement)?.focus());
  }
  private async loadHaUsers() {
    try { this.haUsers = await this._hass!.callWS<Item[]>({ type: "family_organizer/ha_users" }); } catch { this.haUsers = []; }
  }
  private applyHaUser(userId: string) {
    if (!this.editor) return;
    const user = this.haUsers.find((u: Item) => u.id === userId);
    const item: Item = { ...this.editor.item, user_id: userId || null, sync_picture: !!user };
    if (user) { if (!item.name) item.name = user.name; if (user.picture) item.profile_picture = user.picture; }
    this.editor = { ...this.editor, item };
  }
  private async saveEditor(event: SubmitEvent) {
    event.preventDefault();
    if (!this.editor || this.saving) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form), v = Object.fromEntries(values), { kind, item } = this.editor;
    let resource = "", collection = "items", patch: Item = { ...item };
    const number = (name: string) => Number(v[name]) || 0;
    const text = (name: string) => String(v[name] || "").trim();
    const checked = (name: string) => values.has(name);
    if (kind === "delete") {
      const editor = this.editor;
      await this.action(() => this._hass!.callWS({ type: "family_organizer/delete", resource: editor.resource, collection: editor.collection || "items", item_id: item.id }), this.languageCode === "nl" ? "Verwijderd" : "Deleted", true);
      return;
    }
    if (kind === "recipe-import") {
      const url = text("url");
      this.saving = true; this.error = "";
      try {
        const imported = await this._hass!.callWS<Item>({ type: "family_organizer/import_recipe", url });
        this.saving = false;
        this.notice = this.languageCode === "nl" ? "Recept gevonden. Controleer de details en sla op." : "Recipe found. Review the details and save.";
        this.openEditor("recipe", { title: imported.title, image: imported.image, servings: imported.servings, prep_time: imported.prep_time, cook_time: imported.cook_time, tags: imported.tags, steps: imported.steps, ingredients: parseIngredients((imported.ingredient_lines || []).join("\n")), source_url: imported.source_url });
      } catch (error) { this.saving = false; this.error = this.message(error); }
      return;
    }
    if (kind === "event") {
      resource = "calendar";
      const allDay = checked("all_day"), day = text("day"), endDay = text("end_day");
      patch = { ...patch, title: text("title"), start: allDay ? day : `${day}T${text("start")}:00`, end: allDay ? shift(endDay, 1) : `${endDay}T${text("end")}:00`, all_day: allDay, description: text("description"), location: text("location"), recurrence: text("recurrence") || null, person_ids: values.getAll("person_ids"), shared: checked("shared"), reminder_minutes: v.reminder === "" || v.reminder === undefined ? null : Number(v.reminder) };
      if (new Date(patch.end) <= new Date(patch.start)) { this.error = this.tm("The event must end after it starts."); return; }
    } else if (kind === "grocery") {
      resource = "groceries";
      patch = { ...patch, name: text("name"), quantity: number("quantity"), unit: text("unit"), notes: text("notes"), store: text("store"), list_id: text("list_id"), assignee_id: text("assignee_id") || null, checked: !!item.checked, shared: checked("shared") };
    } else if (kind === "list") {
      resource = "groceries"; collection = "lists";
      patch = { ...patch, name: text("name"), store: text("store"), shared: checked("shared") };
    } else if (kind === "todo") {
      resource = "todos";
      patch = { ...patch, title: text("title"), notes: text("notes"), list_id: text("list_id"), due_date: text("due_date") || null, assignee_id: text("assignee_id") || null, done: !!item.done, shared: checked("shared") };
    } else if (kind === "todolist") {
      resource = "todos"; collection = "lists";
      patch = { ...patch, name: text("name"), shared: checked("shared") };
    } else if (kind === "journal") {
      resource = "journal";
      patch = { ...patch, title: text("title"), body: text("body"), day: text("day"), person_ids: values.getAll("person_ids"), photos: text("photos").split(/\r?\n/).map(x => x.trim()).filter(Boolean), shared: checked("shared") };
    } else if (kind === "contact") {
      resource = "contacts";
      const lines = (key: string) => text(key).split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
      patch = { ...patch, name: text("name"), group: text("group"), phones: lines("phones"), emails: lines("emails"), address: text("address"), notes: text("notes"), shared: checked("shared") };
    } else if (kind === "meal") {
      resource = "groceries"; collection = "meal_slots";
      const recipe = (this.data.recipes.items || []).find((r: Item) => r.id === text("recipe_id"));
      patch = { ...patch, day: text("day"), slot: text("slot"), recipe_id: recipe?.id || null, title: recipe?.title || text("title"), servings: number("servings") };
      if (!patch.title) { this.error = this.tm("Choose a recipe or enter a meal name."); return; }
      const existing = (this.data.groceries.meal_slots || this.data.groceries.meal_plans || []).find((m: Item) => m.day === patch.day && (m.slot || m.meal) === patch.slot);
      if (existing && existing.id !== item.id) { this.error = this.tm("That meal slot is already planned. Edit it from the planner instead."); return; }
    } else if (kind === "chore") {
      resource = "chores";
      patch = { ...patch, title: text("title"), description: text("description"), icon: text("icon"), points: number("points"), assignee_ids: values.getAll("assignee_ids"), rotate: checked("rotate"), schedule: text("schedule"), weekdays: values.getAll("weekdays").map(Number), month_day: number("month_day"), interval_days: number("interval_days"), due_date: text("due_date") || null, due_time: text("due_time") || null, created: item.created || iso(new Date()), shared: checked("shared") };
      if (patch.schedule === "weekly" && !patch.weekdays.length) { this.error = this.tm("Choose at least one weekday."); return; }
    } else if (kind === "points") {
      await this.action(() => this._hass!.callWS({ type: "family_organizer/adjust_points", person_id: text("person_id"), points: number("points"), note: text("note") }), this.languageCode === "nl" ? "Punten aangepast" : "Points adjusted", true); return;
    } else if (kind === "recipe") {
      resource = "recipes";
      const ingredients = mergeIngredients(text("ingredients"), item.ingredients || []);
      patch = { ...patch, title: text("title"), tags: text("tags").split(",").map(x => x.trim()).filter(Boolean), category_ids: values.getAll("category_ids"), image: text("image") || null, prep_time: number("prep_time"), cook_time: number("cook_time"), servings: number("servings"), ingredients, steps: text("steps").split(/\r?\n/).map(x => x.trim()).filter(Boolean), shared: checked("shared") };
    } else if (kind === "category") {
      resource = "recipes"; collection = "categories";
      patch = { ...patch, name: text("name"), parent_id: text("parent_id") || null };
    } else if (kind === "person") {
      resource = "people";
      const permissions: Item = {};
      capabilities.forEach(cap => { const value = text(cap); if (value !== "default") permissions[cap] = value === "allow"; });
      patch = { ...patch, name: text("name"), initials: text("name").split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase(), color: text("color"), profile_picture: text("profile_picture") || null, user_id: text("user_id") || null, sync_picture: checked("sync_picture"), birthday: text("birthday") || null, role: text("role"), permissions, pin: text("pin"), clear_pin: checked("clear_pin"), shared: true };
    } else if (kind === "preferences") {
      const settings: Item = {};
      ["overview_position", "week_start", "time_format", "default_calendar_view", "default_grocery_list_id", "competition_default", "language", "theme"].forEach(key => settings[key] = text(key));
      settings.overview_collapsed = checked("overview_collapsed");
      settings.sync_interval = number("sync_interval");
      settings.reminders_enabled = checked("reminders_enabled");
      settings.default_reminder_minutes = number("default_reminder_minutes");
      settings.notify_service = text("notify_service");
      settings.daily_agenda_time = text("daily_agenda_time");
      settings.meal_slots = values.getAll("meal_slots").map(value => String(value));
      settings.stores = text("stores").split(",").map(x => x.trim()).filter(Boolean);
      if (!settings.meal_slots.length) { this.error = this.tm("Enter at least one meal slot."); return; }
      try { new Intl.DateTimeFormat(settings.language); } catch { this.error = this.tm("Enter a valid language code, such as en, de or fr."); return; }
      if (await this.action(() => this._hass!.callWS({ type: "family_organizer/settings", settings }), this.languageCode === "nl" ? "Voorkeuren opgeslagen" : "Preferences saved", true)) {
        this.localOverview = undefined;
        this.theme = settings.theme; localStorage.setItem("family-organizer-theme", this.theme);
      }
      return;
    }
    if (resource) {
      ["occurrence_start", "occurrence_end", "unsupported_recurrence", "day", "start_time", "end_time"].forEach(key => {
        if (resource === "calendar") delete patch[key];
      });
      await this.action(() => this.mutate(resource, patch, collection), item.id ? (this.languageCode === "nl" ? "Wijzigingen opgeslagen" : "Changes saved") : (this.languageCode === "nl" ? "Toegevoegd aan je gezinsorganizer" : "Added to your family organizer"), true);
    }
  }

  render() {
    const current = pages.find(p => p.id === this.page)!;
    const effective = this.theme === "auto" ? (this._hass?.themes?.darkMode ? "dark" : "auto") : this.theme;
    return html`<div class="app" data-theme=${effective}>
      <a class="skip-link" href="#main" @click=${(e: Event) => { e.preventDefault(); (this.renderRoot.querySelector("main") as HTMLElement).focus(); }}>${this.t("skip_content")}</a>
      <aside class="sidebar"><a class="brand" href="#fo/today" @click=${() => this.navigate("today")}><span class="brand-symbol">⌂</span><span>Family<br><strong>Organizer</strong></span></a><p class="eyebrow">${this.t("family_sync")}</p>
        <button class="quick-add" @click=${() => this.openEditor("quick")} ?disabled=${this.loading || this.saving || !this.data.people}><span aria-hidden="true">+</span> ${this.t("quick_add")}</button>
        <nav aria-label=${this.x("Main navigation")}>${pages.map(page => html`<button class=${this.page === page.id ? "active" : ""} aria-current=${this.page === page.id ? "page" : nothing} @click=${() => this.navigate(page.id)}><span class="nav-icon" aria-hidden="true">${page.icon}</span>${this.pageName(page.id, page.name)}</button>`)}</nav>
        <div class="sidebar-family"><span class="eyebrow">${this.t("our_people")}</span><div class="avatar-stack">${this.people.map((p: Item) => this.avatar(p.id))}</div><p>${this.people.length ? `${this.people.length} ${this.x("people. One shared home.")}` : this.t("family_starts")}</p></div>
        ${this.haMenuButton()}
        <small class="sidebar-note">${this.t("made_together")}</small>
      </aside>
      <div class="workspace"><header class="topbar"><div><span class="eyebrow">${this.date(iso(new Date()), { weekday: "long", month: "short", day: "numeric" })}</span><h1>${this.pageName(current.id, current.name)}</h1><p>${this.pageSubtitle(current.id, current.subtitle)}</p></div></header>
        <main id="main" tabindex="-1" aria-busy=${this.loading || this.saving}>
          ${this.error && !this.editor ? html`<div class="banner error" role="alert"><span>${this.error}</span><button @click=${() => void this.load()}>${this.t("retry")}</button></div>` : nothing}
          ${this.notice ? html`<div class="banner success" role="status">${this.notice}<button aria-label=${this.x("Dismiss notification")} @click=${() => this.notice = ""}>×</button></div>` : nothing}
          ${this.saving ? html`<p class="saving" role="status">${this.t("saving_changes")}</p>` : nothing}
          ${this.loading ? html`<div class="empty loading" role="status"><span class="spinner"></span><h2>${this.t("getting_together")}</h2><p>${this.t("loading_copy")}</p></div>` : !this.data.people ? html`<div class="empty"><h2>${this.t("could_not_load")}</h2><p>${this.t("check_connection_permissions")}</p><button class="primary" @click=${() => void this.load()}>${this.t("try_again")}</button></div>` : this.locked ? html`<section class="surface lock-screen"><h2>${this.t("unlock_title")}</h2><p class="muted">${this.t("unlock_text")}</p><form @submit=${(e: SubmitEvent) => void this.verifyPin(e)}><label>${this.t("family_member")}<select name="person" @change=${(e: Event) => this.switchProfile((e.target as HTMLSelectElement).value)}>${this.people.map((person: Item) => html`<option value=${person.id} ?selected=${person.id === this.pinPersonId}>${person.name}</option>`)}</select></label><label>${this.t("pin")}<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" minlength="4" maxlength="8" autofocus></label><div class="dialog-footer"><button class="primary" type="submit" ?disabled=${this.saving}>${this.t("unlock")}</button></div></form></section>` : this.renderPage()}
        </main>
      </div>
      <nav class="mobile-nav" aria-label=${this.x("Mobile navigation")}>${pages.map(page => html`<button class=${this.page === page.id ? "active" : ""} aria-current=${this.page === page.id ? "page" : nothing} @click=${() => this.navigate(page.id)}><span aria-hidden="true">${page.icon}</span>${this.pageName(page.id, page.name)}</button>`)}${this.pinPersonId && !this.locked ? html`<button @click=${() => this.lockScreen()}><span aria-hidden="true">🔒</span>${this.t("lock")}</button>` : nothing}${this.haMenuButton(true)}</nav>
      ${this.editor ? this.dialog() : nothing}
    </div>`;
  }
  private async exportCalendar() {
    try {
      const response = await this._hass!.fetchWithAuth("/api/family_organizer/calendar.ics");
      if (!response.ok) throw new Error(await response.text());
      const url = URL.createObjectURL(await response.blob()), link = document.createElement("a");
      link.href = url; link.download = "family-organizer.ics"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.notice = this.t("calendar_exported");
    } catch (err) {
      this.error = `${this.t("could_not_export_calendar")}: ${(err as Error).message}`;
    }
  }
  private haMenuButton(mobile = false) {
    return html`<button type="button" class=${`ha-shell-menu ${mobile ? "" : "sidebar-ha-menu"}`} aria-label=${this.t("open_ha_navigation")} @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true, detail: {} }))}><span class="ha-menu-icon" aria-hidden="true"></span><span>${mobile ? this.t("ha_menu") : this.t("home_assistant")}</span></button>`;
  }
  private renderPage() {
    switch (this.page) {
      case "today": return this.today();
      case "calendar": return this.calendar();
      case "groceries": return this.groceries();
      case "todos": return this.todos();
      case "chores": return this.chores();
      case "recipes": return this.recipes();
      case "journal": return this.journal();
      case "contacts": return this.contacts();
      case "birthdays": return this.birthdays();
      default: return this.settings();
    }
  }
  private empty(title: string, description: string, button?: TemplateResult | typeof nothing) { return html`<div class="empty"><span class="empty-icon" aria-hidden="true">✧</span><h3>${this.x(title)}</h3><p>${this.x(description)}</p>${button || nothing}</div>`; }
  private addButton(label: string, kind: string, enabled: boolean, item: Item = {}) { return enabled ? html`<button class="primary" @click=${() => this.openEditor(kind, item)}>+ ${this.x(label)}</button>` : nothing; }
  private filters() {
    const toggle = (id: string) => { const next = new Set(this.personFilter); next.has(id) ? next.delete(id) : next.add(id); this.personFilter = next; };
    return html`<div class="person-strip" role="group" aria-label=${this.s("Filter calendar by family member", "Filter agenda op familielid")}><button class=${!this.personFilter.size ? "person-pick everyone active" : "person-pick everyone"} aria-pressed=${!this.personFilter.size} @click=${() => this.personFilter = new Set()}><span class="avatar fallback" aria-hidden="true">⌂</span><span>${this.s("Everyone", "Iedereen")}</span></button>${this.people.map((p: Item) => html`<button class=${this.personFilter.has(p.id) ? "person-pick active" : "person-pick"} style=${`--person-color:${this.color(p.color)}`} aria-pressed=${this.personFilter.has(p.id)} @click=${() => toggle(p.id)}>${this.avatar(p.id)}<span>${p.name}</span></button>`)}</div>`;
  }
  private calendar() {
    const dates = calendarDates(this.selectedDay, this.calendarView, this.firstDay);
    const all = occurrences(this.data.calendar.items || [], dates[0], dates.at(-1)!);
    const query = this.calendarSearch.trim().toLowerCase();
    const events = all.filter(e => (!this.personFilter.size || (e.person_ids || []).some((id: string) => this.personFilter.has(id))) && (!query || [e.title, e.location, e.description].some(v => String(v || "").toLowerCase().includes(query))));
    const selected = eventsOnDay(events, this.selectedDay);
    const unsupported = (this.data.calendar.items || []).filter((event: Item) => unsupportedRecurrence(event.recurrence) && (!this.personFilter.size || (event.person_ids || []).some((id: string) => this.personFilter.has(id))));
    const collapsed = this.localOverview ?? this.settingsData.overview_collapsed;
    const title = this.calendarView === "month" ? this.date(this.selectedDay, { month: "long", year: "numeric" }) : this.calendarView === "day" ? this.date(this.selectedDay) : `${this.date(dates[0], { month: "short", day: "numeric" })} – ${this.date(dates.at(-1)!, { month: "short", day: "numeric", year: "numeric" })}`;
    return html`<section aria-label=${this.s("Family calendar", "Gezinsagenda")}><div class="section-toolbar"><div class="date-navigation"><button class="icon-button" aria-label=${this.s("Previous period", "Vorige periode")} @click=${() => this.selectedDay = moveDate(this.selectedDay, this.calendarView, -1)}>‹</button><button @click=${() => this.selectedDay = iso(new Date())}>${this.s("Today", "Vandaag")}</button><button class="icon-button" aria-label=${this.s("Next period", "Volgende periode")} @click=${() => this.selectedDay = moveDate(this.selectedDay, this.calendarView, 1)}>›</button><h2>${title}</h2></div><div class="toolbar-actions"><div class="segmented" role="group" aria-label=${this.s("Calendar view", "Agendaweergave")}>${[["list", this.s("List", "Lijst")], ["day", this.s("Day", "Dag")], ["week", this.s("Week", "Week")], ["month", this.s("Month", "Maand")]].map(([view, label]) => html`<button class=${this.calendarView === view ? "active" : ""} aria-pressed=${this.calendarView === view} @click=${() => this.calendarView = String(view)}>${label}</button>`)}</div><label class="sr-only" for="calendar-search">${this.s("Search events", "Zoek afspraken")}</label><input id="calendar-search" class="calendar-search" type="search" placeholder=${this.s("Search events…", "Zoek afspraken…")} .value=${this.calendarSearch} @input=${(e: Event) => this.calendarSearch = (e.target as HTMLInputElement).value}><label class="sr-only" for="calendar-date">${this.s("Go to date", "Ga naar datum")}</label><input id="calendar-date" type="date" .value=${this.selectedDay} @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this.selectedDay = value; }}><button type="button" title=${this.s("Download the family calendar as an .ics file for Google, Apple or Outlook", "Download de gezinsagenda als .ics-bestand voor Google, Apple of Outlook")} @click=${() => void this.exportCalendar()}>${this.s("Export .ics", "Exporteer .ics")}</button></div></div>
      ${this.filters()}
      <div class=${`calendar-shell overview-${this.settingsData.overview_position || "right"} ${collapsed ? "overview-closed" : ""}`}><div class="calendar-surface">
        ${this.calendarView === "month" ? html`<div class="weekday-row">${dates.slice(0, 7).map(day => html`<span>${this.date(day, { weekday: "short" })}</span>`)}</div><div class="month-grid">${dates.map(day => {
          const items = eventsOnDay(events, day);
          return html`<div class=${`month-cell ${day.slice(0, 7) !== this.selectedDay.slice(0, 7) ? "outside" : ""} ${day === this.selectedDay ? "selected" : ""}`}>
            <div class="cell-heading"><button class=${day === iso(new Date()) ? "day-number today" : "day-number"} aria-label=${`${this.s("Agenda for", "Agenda voor")} ${this.date(day)}`}
            <button class="cell-create" aria-label=${`${this.s("Create event on", "Afspraak maken op")} ${this.date(day)}`} ?disabled=${!this.canEvent()} @click=${() => { this.selectedDay = day; this.openEditor("event", { day }); }}></button>
            <div class="cell-events">${items.slice(0, 3).map(event => this.eventChip(event))}${items.length > 3 ? html`<button class="more-events" @click=${() => this.selectedDay = day}>+${items.length - 3} ${this.s("more", "meer")}</button>` : nothing}</div>
          </div>`;
        })}</div>` : this.calendarView === "list" ? this.listView(dates, events) : this.timeGrid(dates, events)}
      </div><aside class="agenda"><button class="agenda-toggle" aria-expanded=${!collapsed} @click=${() => { this.localOverview = !collapsed; this.requestUpdate(); if (this.can("manage_settings")) void this.action(() => this._hass!.callWS({ type: "family_organizer/settings", settings: { overview_collapsed: !collapsed } }), this.s("Overview updated", "Overzicht bijgewerkt")); }}>${collapsed ? this.s("Show", "Toon") : this.s("Hide", "Verberg")} ${this.s("day agenda", "dagagenda")} <span aria-hidden="true">${collapsed ? "+" : "−"}</span></button>${collapsed ? nothing : html`<span class="eyebrow">${this.s("THE DAY AT A GLANCE", "DE DAG IN ÉÉN OOGOPSLAG")}</span><h2>${this.date(this.selectedDay, { weekday: "long" })}</h2><p class="muted">${this.date(this.selectedDay, { month: "long", day: "numeric" })} · ${selected.length} ${this.s("events", "afspraken")}</p><div class="agenda-events">${selected.length ? selected.map(event => html`<button class="agenda-event" style=${`--event-color:${this.eventColor(event)}`} @click=${() => this.openEditor("event-detail", event)}><span class="event-time">${event.all_day ? this.s("All day", "Hele dag") : this.time(event.occurrence_start)}</span><strong>${event.title}</strong><span class="muted">${event.location || this.s("No location", "Geen locatie")}</span><span class="event-people">${(event.person_ids || []).map((id: string) => this.avatar(id))}</span></button>`) : this.empty(this.s("Room to breathe", "Even rust"), this.personFilter.size ? this.s("No events for the selected family members.", "Geen afspraken voor de geselecteerde familieleden.") : this.s("Nothing on the calendar for this day.", "Geen afspraken op deze dag."))}</div>${this.addButton(this.s("Add an event", "Afspraak toevoegen"), "event", this.canEvent(), { day: this.selectedDay })}`}</aside></div>
      <p class="calendar-hint">${this.s("Select a day number to see its agenda. Select an empty day or + to add an event.", "Selecteer een dagnummer om de agenda te zien. Kies een lege dag of + om een afspraak toe te voegen.")}</p>
      ${unsupported.length ? html`<div class="banner recurrence-warning" role="status"><p>${this.s("These recurrence rules cannot be expanded in this calendar. Their original text is preserved; only the original event is shown when it falls in the displayed period.", "Deze herhaalregels kunnen in deze agenda niet worden uitgewerkt. De originele tekst blijft bewaard; alleen de originele afspraak wordt getoond als die binnen de periode valt.")}</p><ul>${unsupported.map((event: Item) => html`<li><strong>${event.title}</strong>: <code>${event.recurrence}</code></li>`)}</ul></div>` : nothing}
    </section>`;
  }
  private listView(dates: string[], events: Item[]) {
    const today = iso(new Date()), tomorrow = shift(today, 1);
    const label = (day: string) => day === today ? this.s("Today", "Vandaag") : day === tomorrow ? this.s("Tomorrow", "Morgen") : this.date(day, { weekday: "long" });
    const days = dates.map(day => ({ day, items: eventsOnDay(events, day) })).filter(({ day, items }) => items.length || day === today);
    if (!days.length) return html`<div class="list-view">${this.empty(this.s("Room to breathe", "Even rust"), this.calendarSearch ? this.s("No events match your search.", "Geen afspraken gevonden voor je zoekopdracht.") : this.s("Nothing planned in this period.", "Niets gepland in deze periode."))}</div>`;
    return html`<div class="list-view">${days.map(({ day, items }) => html`<section class=${`list-day ${day === today ? "is-today" : ""}`}>
      <h3>${label(day)} <span class="list-date">${this.date(day, { day: "numeric", month: "long" })}</span></h3>
      ${items.length ? items.map(event => this.listEvent(event)) : html`<p class="muted empty-day">${this.s("Nothing on the calendar for this day.", "Geen afspraken op deze dag.")}</p>`}
    </section>`)}</div>`;
  }
  private listEvent(event: Item) {
    return html`<button class="list-event" style=${`--event-color:${this.eventColor(event)}`} @click=${() => this.openEditor("event-detail", event)}>
      <span class="event-time">${event.all_day ? this.s("All day", "Hele dag") : html`${this.time(event.occurrence_start)}<small>${this.time(event.occurrence_end)}</small>`}</span>
      <span><strong>${event.title}</strong>${event.location ? html`<span class="muted">${event.location}</span>` : nothing}</span>
      <span class="event-people">${(event.person_ids || []).map((id: string) => this.avatar(id))}</span>
    </button>`;
  }
  private eventColor(event: Item) { return this.color(this.person(event.person_ids?.[0])?.color || (this.data.calendar.sources || []).find((s: Item) => s.id === event.source_id)?.color); }
  private eventChip(event: Item, style = "") { return html`<button class=${`event-chip ${event.all_day ? "all-day-event" : ""}`} style=${`--event-color:${this.eventColor(event)};${style}`} @click=${() => this.openEditor("event-detail", event)} title=${`${event.all_day ? this.s("All day", "Hele dag") : this.time(event.occurrence_start)} · ${event.title}`}><span class="event-dot" aria-hidden="true"></span><span>${event.all_day ? nothing : html`<time class="event-start" datetime=${event.occurrence_start}>${this.time(event.occurrence_start)}</time> `}<strong>${event.title}</strong></span>${event.recurrence ? html`<span aria-label=${this.s("Repeating event", "Herhalende afspraak")}>↻</span>` : nothing}</button>`; }
  private timeGrid(dates: string[], events: Item[]) {
    const hours = Array.from({ length: 24 }, (_, i) => i), now = new Date();
    return html`<div class="time-scroll"><div class="time-calendar" style=${`--days:${dates.length}`}><div class="time-header"><span></span>${dates.map(day => html`<button class=${day === this.selectedDay ? "active" : ""} @click=${() => this.selectedDay = day}><small>${this.date(day, { weekday: "short" })}</small><strong class=${day === iso(now) ? "today" : ""}>${dayDate(day).getDate()}</strong></button>`)}</div><div class="all-day-row"><span>${this.x("All day")}</span>
      <div class="time-body"><div class="time-labels">${hours.map(hour => html`<span>${this.time(`${dates[0]}T${String(hour).padStart(2, "0")}:00:00`)}</span>`)}</div>${dates.map(day => html`<div class="time-column">${hours.map(hour => html`<button class="hour-slot" aria-label=${`${this.s("Add event", "Afspraak toevoegen")} ${this.date(day)} ${this.s("at", "om")} ${hour}:00`} ?disabled=${!this.canEvent()} @click=${() => this.openEditor("event", { day, start_time: `${String(hour).padStart(2, "0")}:00`, end_time: `${String(Math.min(hour + 1, 23)).padStart(2, "0")}:${hour === 23 ? "59" : "00"}` })}></button>`)}<div class="positioned-events">${eventLayout(eventsOnDay(events, day).filter(e => !e.all_day)).map(({ event, lane, columns }, i) => {
        const start = new Date(event.occurrence_start), end = new Date(event.occurrence_end), a = iso(start) < day ? 0 : start.getHours() * 60 + start.getMinutes(), b = iso(end) > day ? 1440 : end.getHours() * 60 + end.getMinutes();
        return this.eventChip(event, `top:${a / 60 * 52}px;height:${Math.max(26, (b - a) / 60 * 52)}px;left:${lane / columns * 100}%;width:${100 / columns}%;z-index:${i + 1}`);
      })}</div>${day === iso(now) ? html`<div class="now-line" style=${`top:${(now.getHours() + now.getMinutes() / 60) * 52}px`} aria-label=${this.s("Current time", "Huidige tijd")}></div>` : nothing}</div>`)}</div></div></div>`;
  }

  private groceries() {
    const grocery = this.data.groceries, lists = grocery.lists || [], current = lists.find((x: Item) => x.id === this.listId);
    let items = (grocery.items || []).filter((x: Item) => x.list_id === this.listId && (!this.groceryAssignee || x.assignee_id === this.groceryAssignee));
    items = [...items].sort((a: Item, b: Item) => (this.groupStores ? (a.store || "").localeCompare(b.store || "") : 0) || Number(a.checked) - Number(b.checked));
    const bought = items.filter((x: Item) => x.checked).length, can = this.can("manage_groceries");
    return html`<section><div class="shopping-layout"><div class="surface shopping-list"><div class="surface-heading"><div><span class="eyebrow">${this.x("SHOPPING LIST")}</span><h2>${current?.name || this.x("Groceries")}</h2><p class="muted">${items.length - bought} ${this.x("to buy")} · ${bought} ${this.x("in the basket")}</p></div>${this.addButton("Add item", "grocery", can, { list_id: this.listId, store: current?.store || "" })}</div>
      <div class="list-tabs" role="group" aria-label=${this.x("Grocery lists")}>${lists.map((list: Item) => html`<button class=${list.id === this.listId ? "active" : ""} aria-pressed=${list.id === this.listId} @click=${() => this.listId = list.id}>${list.name}</button>`)}</div>
      <div class="list-tools"><label>${this.x("Assigned to")}<select .value=${this.groceryAssignee} @change=${(e: Event) => this.groceryAssignee = (e.target as HTMLSelectElement).value}><option value="">${this.x("Everyone")}</option>${this.peopleOptions()}</select></label><label class="check"><input type="checkbox" .checked=${this.groupStores} @change=${() => this.groupStores = !this.groupStores}>${this.x("Group by store")}</label>${can ? html`<button ?disabled=${!bought || this.saving} @click=${() => void this.action(async () => { for (const item of items.filter((x: Item) => x.checked)) await this._hass!.callWS({ type: "family_organizer/delete", resource: "groceries", item_id: item.id }); }, "Bought items cleared")}>${this.x("Clear bought")}</button>` : nothing}</div>
      <div class="grocery-items">${items.length ? items.map((item: Item, i: number) => html`${this.groupStores && (i === 0 || items[i - 1].store !== item.store) ? html`<h3 class="store-heading">${item.store || this.x("No store")}</h3>` : nothing}<article class=${`grocery-row ${item.checked ? "checked" : ""}`}><input type="checkbox" aria-label=${`${this.x("Mark")} ${item.name} ${this.x(item.checked ? "to buy" : "bought")}`} .checked=${!!item.checked} ?disabled=${!can || this.saving} @change=${() => void this.action(() => this.mutate("groceries", { ...item, checked: !item.checked }), item.checked ? "Moved back to your list" : "Added to the basket")}><div class="row-copy"><strong>${item.name}</strong><span class="muted">${fraction(Number(item.quantity))} ${item.unit || ""}${item.notes ? ` · ${item.notes}` : ""}${item.store ? ` · ${item.store}` : ""}</span></div><span title=${`${this.x("Created by")} ${this.person(item.creator_id)?.name || this.x("a family member")}`}>${this.avatar(item.creator_id)}</span>${item.assignee_id ? html`<span title=${`${this.x("Assigned to")} ${this.person(item.assignee_id)?.name || this.x("a family member")}`}>${this.avatar(item.assignee_id)}</span>` : nothing}${can ? html`<button class="icon-button" aria-label=${`${this.x("Edit")} ${item.name}`} @click=${() => this.openEditor("grocery", item)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${item.name}`} @click=${() => this.confirmDelete("groceries", item)}>×</button>` : nothing}</article>`) : this.empty("A fresh start", this.groceryAssignee ? "No items assigned to this person." : "Add an item or send ingredients from a recipe.", this.addButton("Add your first item", "grocery", can, { list_id: this.listId }))}</div></div>
      <aside class="surface shopping-aside"><span class="eyebrow">${this.x("A LITTLE ORGANIZATION")}</span><h3>${this.x("One list for every stop")}</h3><p class="muted">${this.x("Keep the supermarket, farmers’ market and pantry runs separate. Matching items merge automatically.")}</p>${this.addButton("New list", "list", can)}${can && current ? html`<button @click=${() => this.openEditor("list", current)}>${this.x("Edit list")}</button><button class="danger" ?disabled=${lists.length < 2} @click=${() => this.confirmDelete("groceries", current, "lists")}>${this.x("Delete list")}</button><small class="muted">${this.x("Deleting a list also removes its grocery items. Keep at least one list.")}</small>` : nothing}<hr><h3>${this.x("What’s cooking?")}</h3><p class="muted">${this.x("Plan the week and shop recipe ingredients straight into this list.")}</p><button @click=${() => this.navigate("recipes")}>${this.x("Meal planner & recipes →")}</button></aside></div></section>`;
  }
  private mealPlanner() {
    const grocery = this.data.groceries, start = shift(weekStart(iso(new Date()), this.firstDay), this.mealWeek * 7), slots = grocery.meal_slots || grocery.meal_plans || [];
    return html`<div class="section-toolbar meal-heading"><div><span class="eyebrow">${this.x("LESS “WHAT’S FOR DINNER?”")}</span><h2>${this.x("Your weekly meal plan")}</h2></div><div class="date-navigation"><button class="icon-button" aria-label=${this.x("Previous meal week")} @click=${() => this.mealWeek--}>‹</button><button @click=${() => this.mealWeek = 0}>${this.x("This week")}</button><button class="icon-button" aria-label=${this.x("Next meal week")} @click=${() => this.mealWeek++}>›</button>
      <div class="meal-grid">${Array.from({ length: 7 }, (_, i) => {
        const day = shift(start, i);
        return html`<article class=${`meal-day ${day === iso(new Date()) ? "meal-today" : ""}`}><header><span>${this.date(day, { weekday: "short" })}</span><strong>${dayDate(day).getDate()}</strong></header>${(this.settingsData.meal_slots || ["breakfast", "lunch", "dinner"]).map((slot: string) => {
          const plan = slots.find((x: Item) => x.day === day && (x.slot || x.meal) === slot);
          return html`<div class="meal-slot"><span class="eyebrow">${this.x(slot)}</span>${plan ? html`<button class="meal-title" @click=${() => this.can("manage_meal_plan") ? this.openEditor("meal", plan) : plan.recipe_id ? this.navigate("recipes", plan.recipe_id) : undefined}>${plan.title}<small>${fraction(Number(plan.servings || 1))} ${this.x("servings")}</small></button>${plan.recipe_id ? html`<button class="text-button" @click=${() => this.navigate("recipes", plan.recipe_id)}>${this.x("Recipe →")}</button>` : nothing}${this.can("manage_meal_plan") ? html`<button class="text-button danger" aria-label=${`${this.x("Remove")} ${plan.title} · ${day} ${this.x(slot)}`} @click=${() => this.confirmDelete("groceries", plan, "meal_slots")}>${this.x("Remove")}</button>` : nothing}` : this.can("manage_meal_plan") ? html`<button class="meal-empty" aria-label=${`${this.x("Plan")} ${this.x(slot)} ${this.x("on")} ${this.date(day)}`} @click=${() => this.openEditor("meal", { day, slot, servings: 4 })}>+ ${this.x("Plan meal")}</button>` : html`<span class="muted">${this.x("Not planned")}</span>`}</div>`;
        })}</article>`;
      })}</div>`;
  }

  private choreIcon(chore: Item) {
    return html`<ha-icon .icon=${chore.icon || "mdi:check-circle-outline"} aria-hidden="true"></ha-icon><span class="chore-icon-fallback" aria-hidden="true">✓</span>`;
  }
  private chores() {
    const chores = this.data.chores.items || [], completions = this.data.chores.completions || [], due = chores.filter((c: Item) => choreDue(c, this.selectedDay));
    const today = iso(new Date()), periodStart = this.scorePeriod === "week" ? weekStart(today, this.firstDay) : `${today.slice(0, 7)}-01`;
    const next = this.scorePeriod === "week" ? shift(periodStart, 7) : moveDate(periodStart, "month", 1);
    const priorStart = this.scorePeriod === "week" ? shift(periodStart, -7) : moveDate(periodStart, "month", -1);
    const score = (start: string, end: string) => this.people.map((person: Item) => ({ person, points: completions.filter((x: Item) => x.person_id === person.id && iso(new Date(x.completed_at)) >= start && iso(new Date(x.completed_at)) < end).reduce((n: number, x: Item) => n + Number(x.points || 0), 0) })).sort((a: Item, b: Item) => b.points - a.points);
    const scores = score(periodStart, next), previous = score(priorStart, periodStart), max = Math.max(1, ...scores.map((x: Item) => x.points));
    return html`<section><div class="chore-layout"><div class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("TEAMWORK MAKES HOME WORK")}</span><h2>${this.x("The chore board")}</h2></div>${this.addButton("New chore", "chore", this.can("manage_chores"))}</div><div class="section-toolbar"><label>${this.x("Chores for")}<input type="date" .value=${this.selectedDay} @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this.selectedDay = value; }}></label><span class="muted">${due.length} ${this.x("scheduled")} · ${due.filter((c: Item) => completions.some((x: Item) => x.chore_id === c.id && iso(new Date(x.completed_at)) === this.selectedDay)).length} ${this.x("completed")}</span></div>
      <div class="chore-list">${due.length ? due.map((chore: Item) => {
        const ids = chore.assignee_ids || (chore.assignee_id ? [chore.assignee_id] : []), active = ids[(Number(chore.rotation_index) || 0) % Math.max(1, ids.length)];
        const done = completions.some((x: Item) => x.chore_id === chore.id && iso(new Date(x.completed_at)) === this.selectedDay);
        const overdue = !done && (this.selectedDay < today || (this.selectedDay === today && chore.due_time && chore.due_time < new Date().toTimeString().slice(0, 5)));
        const own = this.me && (ids.includes(this.me.id) || [this.me.id, this._hass?.user?.id].includes(chore.creator_id));
        const canComplete = this.can("complete_any_chore") || (this.can("complete_own_chores") && own);
        return html`<article class=${`chore-card ${done ? "done" : overdue ? "overdue" : ""}`}><div class="chore-symbol" aria-hidden="true">${this.choreIcon(chore)}</div><div class="row-copy"><strong>${chore.title}</strong><span class="muted">${chore.description || (done ? this.x("Nice work!") : overdue ? this.x("Overdue") : `${this.x("Due")} ${chore.due_time || this.x("today")}`)}</span><span class="assignee">${this.avatar(active)}${this.person(active)?.name || this.x("Anyone")}${chore.rotate ? ` · ${this.x("rotating")}` : ""}</span></div><span class="points-badge">${chore.points} ${this.x("pts")}</span><button class=${done ? "" : "primary"} ?disabled=${done || !canComplete || this.saving || this.selectedDay !== today} title=${this.selectedDay !== today ? this.x("Completions are recorded for today") : ""} @click=${() => void this.action(() => this._hass!.callWS({ type: "family_organizer/complete_chore", chore_id: chore.id, ...(this.can("complete_any_chore") ? active ? { person_id: active } : {} : { person_id: this.me.id }) }), "Chore completed. Thank you!")}>${done ? this.x("Done ✓") : this.x("Complete")}</button>${this.can("manage_chores") ? html`<button class="icon-button" aria-label=${`${this.x("Edit")} ${chore.title}`} @click=${() => this.openEditor("chore", chore)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${chore.title}`} @click=${() => this.confirmDelete("chores", chore)}>×</button>` : nothing}</article>`;
      }) : this.empty("All clear for this day", "Schedule a chore to share the load.", this.addButton("Create a chore", "chore", this.can("manage_chores")))}</div>
      ${this.selectedDay !== today ? html`<p class="muted">${this.x("You’re browsing another day. Chore completions are recorded for today only.")}</p>` : nothing}
      <details class="all-chores"><summary>${this.x("All scheduled chores")} (${chores.length})</summary>${chores.map((chore: Item) => html`<div class="compact-row"><span>${chore.title} <small class="muted">· ${this.x(chore.schedule)}</small></span>${this.can("manage_chores") ? html`<button @click=${() => this.openEditor("chore", chore)}>${this.x("Edit")}</button>` : nothing}</div>`)}</details></div>
      <aside class="surface leaderboard"><span class="eyebrow">${this.x("A FRIENDLY LITTLE COMPETITION")}</span><h2>${this.x("Family leaderboard")}</h2><div class="segmented" role="group" aria-label=${this.x("Score period")}>${["week", "month"].map(period => html`<button class=${this.scorePeriod === period ? "active" : ""} aria-pressed=${this.scorePeriod === period} @click=${() => this.scorePeriod = period}>${this.x(period === "week" ? "This week" : "This month")}</button>`)}</div><p class="muted">${this.date(periodStart, { month: "short", day: "numeric" })} – ${this.date(shift(next, -1), { month: "short", day: "numeric" })}</p>${scores.length ? scores.map((s: Item, i: number) => html`<article class="score-row"><span class="rank">${i === 0 && s.points > 0 ? "♛" : i + 1}</span>${this.avatar(s.person.id)}<div class="row-copy"><strong>${s.person.name}</strong><progress max=${max} value=${Math.max(0, s.points)} aria-label=${`${s.person.name}: ${s.points} ${this.x("points")}`}></progress></div><strong>${s.points}<small> ${this.x("pts")}</small></strong></article>`) : this.empty("Meet your team", "Add family members in Settings.")}<div class="prior-winner"><span aria-hidden="true">★</span><div><strong>${this.x(this.scorePeriod === "week" ? "Last week’s star" : "Last month’s star")}</strong><p>${previous[0]?.points > 0 ? `${previous[0].person.name} · ${previous[0].points} ${this.x("points")}` : this.x("A fresh start for everyone")}</p></div></div></aside></div>
      <div class="surface history"><div class="surface-heading"><div><span class="eyebrow">${this.x("EVERY CONTRIBUTION COUNTS")}</span><h2>${this.x("Recent activity")}</h2></div>${this.addButton("Adjust points", "points", this.can("manage_chores") && this.people.length > 0)}</div>${completions.length ? [...completions].sort((a: Item, b: Item) => b.completed_at.localeCompare(a.completed_at)).slice(0, 30).map((completion: Item) => html`<div class="compact-row">${this.avatar(completion.person_id)}<span class="row-copy"><strong>${this.person(completion.person_id)?.name || this.x("Family member")}</strong><span class="muted">${completion.note || chores.find((c: Item) => c.id === completion.chore_id)?.title || (completion.adjustment ? this.x("Manual adjustment") : this.x("Completed chore"))}</span></span><time>${this.date(iso(new Date(completion.completed_at)), { month: "short", day: "numeric" })} · ${this.time(completion.completed_at)}</time><strong>${completion.points > 0 ? "+" : ""}${completion.points} ${this.x("pts")}</strong></div>`) : this.empty("Your story starts here", "Completed chores and point adjustments will appear here.")}</div>
    </section>`;
  }

  private recipes() {
    const recipes = this.data.recipes.items || [], categories = this.data.recipes.categories || [];
    if (this.recipeId) {
      const recipe = recipes.find((r: Item) => r.id === this.recipeId);
      return recipe ? this.recipeDetail(recipe) : html`<button @click=${() => this.navigate("recipes")}>← ${this.t("all_recipes")}</button>${this.empty(this.t("recipe_not_found"), this.t("recipe_missing_access"))}`;
    }
    const visible = recipes.filter((r: Item) => (!this.recipeCategory || (r.category_ids || []).includes(this.recipeCategory)) && `${r.title} ${(r.tags || []).join(" ")}`.toLowerCase().includes(this.recipeSearch.toLowerCase()));
    return html`<section>${this.mealPlanner()}<hr><div class="section-toolbar"><div><span class="eyebrow">${this.x("THE FAMILY COOKBOOK")}</span><h2>${this.x("Favorites, all in one place")}</h2></div><div class="toolbar-actions">${this.can("manage_recipes") ? html`<button @click=${() => this.openEditor("recipe-import")}>${this.x("Import from web")}</button>` : nothing}${this.addButton("New recipe", "recipe", this.can("manage_recipes"))}</div></div><div class="recipe-toolbar"><label class="search-label"><span class="sr-only">${this.x("Search recipes or tags")}</span><input type="search" placeholder=${this.x("Search recipes or tags…")} .value=${this.recipeSearch} @input=${(e: Event) => this.recipeSearch = (e.target as HTMLInputElement).value}></label><label>${this.x("Category")}<select .value=${this.recipeCategory} @change=${(e: Event) => this.recipeCategory = (e.target as HTMLSelectElement).value}><option value="">${this.x("All categories")}</option>${categories.map((c: Item) => html`<option value=${c.id}>${this.categoryPath(c)}</option>`)}</select></label>${this.can("manage_recipes") ? html`<button @click=${() => this.openEditor("categories")}>${this.x("Manage categories")}</button>` : nothing}</div>
      <div class="recipe-grid">${visible.length ? visible.map((recipe: Item) => html`<button class="recipe-card" @click=${() => this.navigate("recipes", recipe.id)}>${recipe.image ? html`<img src=${recipe.image} alt="" loading="lazy" referrerpolicy="no-referrer">` : html`<div class="recipe-placeholder" aria-hidden="true">♧<span>${this.x("FROM OUR KITCHEN")}</span></div>`}<div class="recipe-card-copy"><span class="eyebrow">${(recipe.category_ids || []).map((id: string) => categories.find((c: Item) => c.id === id)?.name).filter(Boolean).join(" · ") || this.x("Family favorite")}</span><h3>${recipe.title}</h3><p class="muted">${Number(recipe.prep_time || 0) + Number(recipe.cook_time || 0)} min · ${fraction(Number(recipe.servings || 4))} ${this.x("servings")}</p><div class="tags">${(recipe.tags || []).slice(0, 3).map((tag: string) => html`<span>${tag}</span>`)}</div></div></button>`) : this.empty(this.recipeSearch || this.recipeCategory ? "No recipes match" : "Start your family cookbook", "Save a favorite recipe, scale its servings and send ingredients to your lists.", this.addButton("Add a recipe", "recipe", this.can("manage_recipes")))}</div></section>`;
  }
  private categoryPath(category: Item) {
    const path = [category.name], seen = new Set([category.id]); let parent = category.parent_id;
    while (parent && !seen.has(parent)) { seen.add(parent); const item = (this.data.recipes.categories || []).find((c: Item) => c.id === parent); if (!item) break; path.unshift(item.name); parent = item.parent_id; }
    return path.join(" / ");
  }
  private recipeDetail(recipe: Item) {
    const amount = this.servings[recipe.id] ?? (Number(recipe.servings) || 4), base = Number(recipe.servings) || 1, ingredients = recipe.ingredients || [];
    const selected = this.selectedIngredients[recipe.id] || new Set<number>(ingredients.map((_: Item, i: number) => i)), lists = this.data.groceries.lists || [];
    return html`<section><div class="section-toolbar"><button @click=${() => this.navigate("recipes")}>← ${this.t("all_recipes")}</button><div class="toolbar-actions">${this.can("manage_recipes") ? html`<button @click=${() => this.openEditor("recipe", recipe)}>${this.x("Edit recipe")}</button><button class="danger" @click=${() => this.confirmDelete("recipes", recipe)}>${this.t("delete")}</button>` : nothing}</div></div>
      <div class="recipe-hero">${recipe.image ? html`<img src=${recipe.image} alt=${recipe.title} referrerpolicy="no-referrer">` : html`<div class="recipe-hero-art" aria-hidden="true">♧</div>`}<div><span class="eyebrow">${this.x("FROM THE FAMILY COOKBOOK")}</span><h2>${recipe.title}</h2><div class="tags">${(recipe.tags || []).map((tag: string) => html`<span>${tag}</span>`)}</div><p class="muted">${this.x("Prep")} ${recipe.prep_time || 0} min · ${this.x("Cook")} ${recipe.cook_time || 0} min</p>${this.addButton("Plan this meal", "meal", this.can("manage_meal_plan"), { day: this.selectedDay, slot: (this.settingsData.meal_slots || ["dinner"])[0], recipe_id: recipe.id, title: recipe.title, servings: amount })}</div></div>
      <div class="recipe-detail-grid"><div class="surface ingredient-panel"><div class="surface-heading"><h3>${this.x("Ingredients")}</h3><div class="serving-control"><button aria-label=${this.x("Decrease servings")} ?disabled=${amount <= .25} @click=${() => this.servings = { ...this.servings, [recipe.id]: Math.max(.25, amount - .25) }}>−</button><label><span class="sr-only">${this.x("Servings")}</span><input type="number" min=".25" step=".25" .value=${String(amount)} @change=${(e: Event) => { const n = Number((e.target as HTMLInputElement).value); if (n > 0) this.servings = { ...this.servings, [recipe.id]: n }; }}></label><button aria-label=${this.x("Increase servings")} @click=${() => this.servings = { ...this.servings, [recipe.id]: amount + .25 }}>+</button></div></div><p class="muted">${fraction(amount)} ${this.x("servings")} · ${this.x("automatically scaled from")} ${base}</p><p class="muted">${this.x("Check ingredients to send to your grocery lists.")}</p>
        ${ingredients.map((ingredient: Item, i: number) => html`<div class="ingredient-row"><label class="check"><input type="checkbox" .checked=${selected.has(i)} @change=${() => { const next = new Set(selected); next.has(i) ? next.delete(i) : next.add(i); this.selectedIngredients = { ...this.selectedIngredients, [recipe.id]: next }; }}><span><strong>${fraction(Number(ingredient.amount || 0) * amount / base)} ${ingredient.unit || ""}</strong> ${ingredient.name}</span></label><label><span class="sr-only">${this.x("List for")} ${ingredient.name}</span><select .value=${this.routes[recipe.id]?.[String(i)] || this.listId} @change=${(e: Event) => this.routes = { ...this.routes, [recipe.id]: { ...this.routes[recipe.id], [String(i)]: (e.target as HTMLSelectElement).value } }}>${lists.map((list: Item) => html`<option value=${list.id}>${list.name}</option>`)}</select></label></div>`)}
        <button class="primary wide" ?disabled=${!this.can("manage_groceries") || !selected.size || !lists.length || this.saving} @click=${() => void this.action(() => this._hass!.callWS({ type: "family_organizer/recipe_to_groceries", recipe_id: recipe.id, servings: amount, list_id: this.listId, selected: [...selected].sort((a, b) => a - b), routes: this.routes[recipe.id] || {} }), `${selected.size} ${this.x("ingredients sent to your grocery lists")}`)}>+ ${this.x("Add selected to groceries")}</button>
      </div><div class="surface method-panel"><span class="eyebrow">${this.x("LET’S MAKE SOMETHING GOOD")}</span><h3>${this.x("Method")}</h3><ol>${(recipe.steps || recipe.instructions || []).map((step: string) => html`<li>${step}</li>`)}</ol>${!(recipe.steps || recipe.instructions || []).length ? html`<p class="muted">${this.x("No instructions yet. Edit this recipe to add the method.")}</p>` : nothing}</div></div></section>`;
  }

  private today() {
    const today = iso(new Date()), week = shift(today, 6);
    const events = eventsOnDay(occurrences(this.data.calendar.items || [], today, today), today);
    const upcoming = occurrences(this.data.calendar.items || [], shift(today, 1), week).slice(0, 6);
    const groceries = (this.data.groceries.items || []).filter((x: Item) => !x.checked), todos = (this.data.todos?.items || []).filter((x: Item) => !x.done);
    const chores = (this.data.chores.items || []).filter((c: Item) => choreDue(c, today)), completions = this.data.chores.completions || [];
    const meals = (this.data.groceries.meal_slots || this.data.groceries.meal_plans || []).filter((m: Item) => m.day === today);
    const birthdays: BirthdayRow[] = this.people.map((p: Item) => ({ person: p, next: nextBirthday(p.birthday, today) })).filter((x: BirthdayRow) => x.next && x.next.days <= 14).sort((a: BirthdayRow, b: BirthdayRow) => a.next!.days - b.next!.days);
    const greeting = this.x(new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening");
    const summary = `${events.length ? `${events.length} ${this.x(events.length === 1 ? "event" : "events")}` : this.x("A quiet calendar")} · ${chores.length} ${this.x(chores.length === 1 ? "chore" : "chores")} · ${groceries.length} ${this.x("to buy")} · ${todos.length} ${this.x("to do")}`;
    return html`<section class="today-page"><div class="today-hero"><div><span class="eyebrow">${this.date(today)}</span><h2>${greeting}${this.me ? `, ${this.me.name.split(" ")[0]}` : ""}.</h2><p class="muted">${summary}</p></div>
      ${birthdays.length ? html`<div class="birthday-callout">${birthdays.map((b: BirthdayRow) => html`<span>${this.avatar(b.person.id)}<strong>${b.person.name}</strong> ${this.x(b.next!.days === 0 ? "turns" : "soon turns")} ${b.next!.age ?? this.x("another year")}${b.next!.days === 0 ? ` ${this.x("today 🎉")}` : ` ${this.x("in")} ${b.next!.days} ${this.x(b.next!.days === 1 ? "day" : "days")}`}</span>`)}</div>` : nothing}</div>
      <div class="today-grid">
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("TODAY’S AGENDA")}</span><h3>${this.x("Calendar")}</h3></div><button @click=${() => { this.selectedDay = today; this.navigate("calendar"); }}>${this.x("Open calendar →")}</button></div>${events.length ? events.map(event => html`<button class="agenda-event" style=${`--event-color:${this.eventColor(event)}`} @click=${() => this.openEditor("event-detail", event)}><span class="event-time">${event.all_day ? this.x("All day") : this.time(event.occurrence_start)}</span><strong>${event.title}</strong><span class="event-people">${(event.person_ids || []).map((id: string) => this.avatar(id))}</span></button>`) : html`<p class="muted">${this.x("Nothing scheduled today.")}</p>`}${upcoming.length ? html`<span class="eyebrow">${this.x("COMING UP")}</span>${upcoming.map(event => html`<div class="compact-row"><span class="event-dot" style=${`background:${this.eventColor(event)}`}></span><span class="row-copy"><strong>${event.title}</strong><span class="muted">${this.date(iso(new Date(event.occurrence_start)), { weekday: "short", month: "short", day: "numeric" })}${event.all_day ? "" : ` · ${this.time(event.occurrence_start)}`}</span></span></div>`)}` : nothing}${this.addButton("Add an event", "event", this.canEvent(), { day: today })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("WHAT’S FOR DINNER?")}</span><h3>${this.x("Meals")}</h3></div><button @click=${() => this.navigate("recipes")}>${this.x("Meal planner →")}</button></div>${(this.settingsData.meal_slots || ["breakfast", "lunch", "dinner"]).map((slot: string) => { const plan = meals.find((m: Item) => (m.slot || m.meal) === slot); return html`<div class="compact-row"><span class="eyebrow">${this.x(slot)}</span><strong>${plan?.title || html`<span class="muted">${this.x("Not planned")}</span>`}</strong></div>`; })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("SHOPPING")}</span><h3>${groceries.length} ${this.x("to buy")}</h3></div><button @click=${() => this.navigate("groceries")}>${this.x("Shopping lists →")}</button></div>${groceries.slice(0, 6).map((item: Item) => html`<div class="compact-row"><span>• ${item.name}</span><small class="muted">${(this.data.groceries.lists || []).find((l: Item) => l.id === item.list_id)?.name || ""}</small></div>`)}${groceries.length > 6 ? html`<small class="muted">+${groceries.length - 6} ${this.x("more")}</small>` : nothing}${this.addButton("Add item", "grocery", this.can("manage_groceries"), { list_id: this.listId })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("TO DO")}</span><h3>${todos.length} ${this.x("open")}</h3></div><button @click=${() => this.navigate("todos")}>${this.x("To-do lists →")}</button></div>${todos.slice(0, 6).map((item: Item) => html`<label class="check compact-row"><input type="checkbox" ?disabled=${!this.can("manage_todos") || this.saving} @change=${() => void this.action(() => this.mutate("todos", { ...item, done: true }), "Nice, one less thing")}><span class="row-copy"><strong>${item.title}</strong>${item.due_date ? html`<span class="muted">${this.x("Due")} ${this.date(item.due_date, { month: "short", day: "numeric" })}</span>` : nothing}</span>${item.assignee_id ? this.avatar(item.assignee_id) : nothing}</label>`)}${this.addButton("Add to-do", "todo", this.can("manage_todos"), { list_id: this.todoListId })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("CHORES")}</span><h3>${chores.length} ${this.x("today")}</h3></div><button @click=${() => { this.selectedDay = today; this.navigate("chores"); }}>${this.x("Chore board →")}</button></div>${chores.map((chore: Item) => { const ids = chore.assignee_ids || [], active = ids[(Number(chore.rotation_index) || 0) % Math.max(1, ids.length)], done = completions.some((x: Item) => x.chore_id === chore.id && iso(new Date(x.completed_at)) === today); return html`<div class=${`compact-row ${done ? "done" : ""}`}>${this.avatar(active)}<span class="row-copy"><strong>${chore.title}</strong><span class="muted">${done ? this.x("Done ✓") : `${chore.points} ${this.x("pts")}`}</span></span></div>`; })}${!chores.length ? html`<p class="muted">${this.x("No chores due today.")}</p>` : nothing}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("FAMILY JOURNAL")}</span><h3>${this.x("Latest moment")}</h3></div><button @click=${() => this.navigate("journal")}>${this.x("Journal →")}</button></div>${(() => { const latest = [...(this.data.journal?.items || [])].sort((a: Item, b: Item) => `${b.day}`.localeCompare(a.day))[0]; return latest ? html`<p class="eyebrow">${this.date(latest.day, { month: "short", day: "numeric", year: "numeric" })}</p><strong>${latest.title}</strong><p class="muted journal-excerpt">${latest.body}</p>` : html`<p class="muted">${this.x("Write down something worth remembering.")}</p>`; })()}${this.addButton("New entry", "journal", this.can("manage_journal"), { day: today })}</article>
      </div></section>`;
  }

  private todos() {
    const data = this.data.todos || {}, lists = data.lists || [], current = lists.find((x: Item) => x.id === this.todoListId), can = this.can("manage_todos");
    let items = (data.items || []).filter((x: Item) => x.list_id === this.todoListId);
    const open = items.filter((x: Item) => !x.done), done = items.filter((x: Item) => x.done);
    items = [...open.sort((a: Item, b: Item) => (a.due_date || "9").localeCompare(b.due_date || "9")), ...(this.showDoneTodos ? done : [])];
    return html`<section><div class="shopping-layout"><div class="surface shopping-list"><div class="surface-heading"><div><span class="eyebrow">${this.s("TO-DO LIST", "TAKENLIJST")}</span><h2>${current?.name || this.s("To Do", "Taken")}</h2><p class="muted">${open.length} ${this.s("open", "open")} · ${done.length} ${this.s("done", "klaar")}</p></div>${this.addButton(this.s("Add to-do", "Taak toevoegen"), "todo", can, { list_id: this.todoListId })}</div>
      <div class="list-tabs" role="group" aria-label=${this.s("To-do lists", "Takenlijsten")}>${lists.map((list: Item) => html`<button class=${list.id === this.todoListId ? "active" : ""} aria-pressed=${list.id === this.todoListId} @click=${() => this.todoListId = list.id}>${list.name}</button>`)}</div>
      <div class="list-tools"><label class="check"><input type="checkbox" .checked=${this.showDoneTodos} @change=${() => this.showDoneTodos = !this.showDoneTodos}>${this.s("Show completed", "Toon afgerond")}</label>${can ? html`<button ?disabled=${!done.length || this.saving} @click=${() => void this.action(async () => { for (const item of done) await this._hass!.callWS({ type: "family_organizer/delete", resource: "todos", item_id: item.id }); }, this.s("Completed to-dos cleared", "Afgeronde taken verwijderd"))}>${this.s("Clear completed", "Verwijder afgerond")}</button>` : nothing}</div>
      <div class="grocery-items">${items.length ? items.map((item: Item) => this.todoRow(item, can)) : this.empty("Nothing to do", "Add a task, assign it to someone and give it a due date.", this.addButton("Add your first to-do", "todo", can, { list_id: this.todoListId }))}</div></div>
      <aside class="surface shopping-aside"><span class="eyebrow">${this.x("LISTS FOR EVERYTHING")}</span><h3>${this.x("Packing, projects, errands")}</h3><p class="muted">${this.x("Keep separate lists for holidays, home projects or anything else the family needs to get done.")}</p>${this.addButton("New list", "todolist", can)}${can && current ? html`<button @click=${() => this.openEditor("todolist", current)}>${this.x("Edit list")}</button><button class="danger" ?disabled=${lists.length < 2} @click=${() => this.confirmDelete("todos", current, "lists")}>${this.x("Delete list")}</button><small class="muted">${this.x("Deleting a list also removes its to-dos. Keep at least one list.")}</small>` : nothing}<hr><h3>${this.x("Need groceries instead?")}</h3><button @click=${() => this.navigate("groceries")}>${this.x("Shopping lists →")}</button></aside></div></section>`;
  }
  private todoRow(item: Item, can: boolean) {
    const due = item.due_date ? `${this.x("Due")} ${this.date(item.due_date, { weekday: "short", month: "short", day: "numeric" })}` : "";
    const meta = `${due}${item.notes ? `${due ? " · " : ""}${item.notes}` : ""}`;
    const toggle = () => void this.action(() => this.mutate("todos", { ...item, done: !item.done }), item.done ? "Back on the list" : "Nice, one less thing");
    const assignee = item.assignee_id ? html`<span title=${`${this.x("Assigned to")} ${this.person(item.assignee_id)?.name || this.x("a family member")}`}>${this.avatar(item.assignee_id)}</span>` : nothing;
    const actions = can ? html`<button class="icon-button" aria-label=${`${this.x("Edit")} ${item.title}`} @click=${() => this.openEditor("todo", item)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${item.title}`} @click=${() => this.confirmDelete("todos", item)}>×</button>` : nothing;
    return html`<article class=${`grocery-row ${item.done ? "checked" : ""}`}><input type="checkbox" aria-label=${`${this.x("Mark")} ${item.title} ${this.x(item.done ? "open" : "done")}`} .checked=${!!item.done} ?disabled=${!can || this.saving} @change=${toggle}><div class="row-copy"><strong>${item.title}</strong><span class="muted">${meta}</span></div>${assignee}${actions}</article>`;
  }

  private journal() {
    const entries = [...(this.data.journal?.items || [])].filter((e: Item) => !this.journalPerson || (e.person_ids || []).includes(this.journalPerson)).sort((a: Item, b: Item) => `${b.day}`.localeCompare(a.day)), can = this.can("manage_journal");
    return html`<section><div class="section-toolbar"><div><span class="eyebrow">${this.s("THE FAMILY JOURNAL", "HET GEZINSDAGBOEK")}</span><h2>${this.s("Moments worth keeping", "Momenten om te bewaren")}</h2></div><div class="toolbar-actions"><label>${this.t("family_member")}<select .value=${this.journalPerson} @change=${(e: Event) => this.journalPerson = (e.target as HTMLSelectElement).value}><option value="">${this.s("Everyone", "Iedereen")}</option>${this.peopleOptions()}</select></label>${this.addButton(this.s("New entry", "Nieuw item"), "journal", can, { day: iso(new Date()) })}</div></div>
      <div class="journal-feed">${entries.length ? entries.map((entry: Item) => html`<article class="surface journal-entry">
        <div class="detail-date"><span>${this.date(entry.day, { month: "short" })}</span><strong>${dayDate(entry.day).getDate()}</strong></div>
        <div class="journal-body"><span class="eyebrow">${this.date(entry.day, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span><h3>${entry.title}</h3><p>${entry.body}</p>
          ${(entry.photos || []).length ? html`<div class="journal-photos">${entry.photos.map((src: string) => html`<img src=${src} alt="" loading="lazy" referrerpolicy="no-referrer">`)}</div>` : nothing}
          <div class="event-people">${(entry.person_ids || []).map((id: string) => html`<span class="check">${this.avatar(id)}${this.person(id)?.name || ""}</span>`)}</div></div>
        <button class="icon-button" aria-label=${`${this.x("Edit")} ${entry.title}`} @click=${() => this.openEditor("journal", entry)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${entry.title}`} @click=${() => this.confirmDelete("journal", entry)}>×</button>
      </article>`) : this.empty("Your story starts here", this.journalPerson ? "No entries for this family member yet." : "Record first words, big wins and ordinary days you don’t want to forget.", this.addButton("Write the first entry", "journal", can, { day: iso(new Date()) }))}</div></section>`;
  }

  private contacts() {
    const can = this.can("manage_contacts"), query = this.contactQuery.trim().toLowerCase();
    const all = [...(this.data.contacts?.items || [])].sort((a: Item, b: Item) => `${a.name}`.localeCompare(b.name));
    const matches = all.filter((c: Item) => !query || [c.name, c.group, c.address, c.notes, ...(c.phones || []), ...(c.emails || [])].some(v => `${v || ""}`.toLowerCase().includes(query)));
    const groups = [...new Set(matches.map((c: Item) => c.group || this.x("Other")))].sort((a, b) => a === this.x("Other") ? 1 : b === this.x("Other") ? -1 : a.localeCompare(b));
    return html`<section><div class="section-toolbar"><div><span class="eyebrow">${this.s("FAMILY ADDRESS BOOK", "GEZINSADRESBOEK")}</span><h2>${this.s("Who to call", "Wie moet je bellen")}</h2></div><div class="toolbar-actions"><label>${this.s("Search", "Zoeken")}<input type="search" placeholder=${this.s("Name, school, doctor…", "Naam, school, dokter…")} .value=${this.contactQuery} @input=${(e: Event) => this.contactQuery = (e.target as HTMLInputElement).value}></label>${this.addButton(this.s("New contact", "Nieuw contact"), "contact", can)}</div></div>
      ${matches.length ? groups.map(group => html`<h3 class="contact-group">${group}</h3><div class="contact-grid">${matches.filter((c: Item) => (c.group || this.x("Other")) === group).map((contact: Item) => html`<article class="surface contact-card"><div class="contact-avatar" aria-hidden="true">${`${contact.name || "?"}`.split(/\s+/).map((x: string) => x[0]).join("").slice(0, 2).toUpperCase()}</div><div class="row-copy"><h3>${contact.name}</h3>${(contact.phones || []).map((p: string) => html`<a href=${`tel:${p.replace(/[^\d+]/g, "")}`}>☎ ${p}</a>`)}${(contact.emails || []).map((m: string) => html`<a href=${`mailto:${m}`}>✉ ${m}</a>`)}${contact.address ? html`<p class="muted">${contact.address}</p>` : nothing}${contact.notes ? html`<small class="muted">${contact.notes}</small>` : nothing}</div>${can ? html`<div class="journal-actions"><button class="icon-button" aria-label=${`${this.x("Edit")} ${contact.name}`} @click=${() => this.openEditor("contact", contact)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${contact.name}`} @click=${() => this.confirmDelete("contacts", contact)}>×</button></div>` : nothing}</article>`)}</div>`) : this.empty(query ? "No matches" : "Keep everyone close", query ? "Try a different search." : "Babysitters, school, the dentist, grandparents: one shared place for every number.", this.addButton("Add the first contact", "contact", can))}</section>`;
  }

  private birthdays() {
    const today = iso(new Date());
    const rows: BirthdayRow[] = this.people.map((p: Item) => ({ person: p, next: nextBirthday(p.birthday, today) })).sort((a: BirthdayRow, b: BirthdayRow) => (a.next?.days ?? 9999) - (b.next?.days ?? 9999));
    const known = rows.filter(r => r.next), unknown = rows.filter(r => !r.next);
    return html`<section><div class="section-toolbar"><div><span class="eyebrow">${this.x("CELEBRATE TOGETHER")}</span><h2>${this.x("Upcoming birthdays")}</h2></div>${this.addButton("Add a person", "person", this.can("manage_people"))}</div>
      <div class="birthday-grid">${known.length ? known.map(({ person, next }) => html`<article class=${`surface birthday-card ${next!.days === 0 ? "today" : ""}`} style=${`--person-color:${this.color(person.color)}`}>${this.avatar(person.id)}<div class="row-copy"><h3>${person.name}</h3><p class="muted">${this.date(next!.date, { weekday: "long", month: "long", day: "numeric" })}${next!.age !== undefined ? ` · ${this.x("turns")} ${next!.age}` : ""}</p></div><strong class="countdown">${next!.days === 0 ? this.x("Today 🎉") : next!.days === 1 ? this.x("Tomorrow") : `${next!.days} ${this.x("days")}`}</strong>${this.can("manage_people") ? html`<button class="icon-button" aria-label=${`${this.x("Edit")} ${person.name}`} @click=${() => this.openEditor("person", person)}>✎</button>` : nothing}</article>`) : this.empty("No birthdays yet", "Add a birthday to each family member in Settings and we’ll count down for you.", this.addButton("Add a person", "person", this.can("manage_people")))}</div>
      ${unknown.length ? html`<details class="all-chores"><summary>${this.x("Family members without a birthday")} (${unknown.length})</summary>${unknown.map(({ person }) => html`<div class="compact-row">${this.avatar(person.id)}<span>${person.name}</span>${this.can("manage_people") ? html`<button @click=${() => this.openEditor("person", person)}>${this.x("Add birthday")}</button>` : nothing}</div>`)}</details>` : nothing}</section>`;
  }

  private settings() {
    const settings = this.settingsData;
    return html`<section><div class="settings-intro"><span class="eyebrow">${this.languageCode === "nl" ? "JULLIE THUIS, JULLIE MANIER" : "YOUR HOME, YOUR WAY"}</span><h2>${this.languageCode === "nl" ? "Een plek voor iedereen" : "A place for everyone"}</h2><p class="muted">${this.languageCode === "nl" ? "Koppel familieleden aan Home Assistant-gebruikers, kies kleuren en bepaal wie wat mag beheren." : "Link family members to Home Assistant users, choose their colors and set what they can manage."}</p></div><div class="section-toolbar"><h3>${this.t("family_member")}${this.languageCode === "nl" ? "en" : "s"}</h3>${this.addButton(this.languageCode === "nl" ? "Persoon toevoegen" : "Add a person", "person", this.can("manage_people"))}</div><div class="people-grid">${this.people.length ? this.people.map((person: Item) => html`<article class="surface person-card">${this.avatar(person.id)}<div class="row-copy"><h3>${person.name}</h3><p class="muted">${person.role === "parent_admin" ? this.t("role_admin") : person.role === "parent" ? this.t("role_parent") : this.t("role_child")} · ${person.user_id || person.ha_user_id ? this.t("ha_linked") : this.t("ha_not_linked")}</p><small class="muted">${Object.keys(person.permissions || {}).length} ${this.t("permission_overrides")}</small></div>${this.can("manage_people") ? html`<button @click=${() => this.openEditor("person", person)}>${this.languageCode === "nl" ? "Bewerken" : "Edit"}</button><button class="icon-button danger" aria-label=${`${this.languageCode === "nl" ? "Verwijder" : "Remove"} ${person.name}`} @click=${() => this.confirmDelete("people", person)}>×</button>` : nothing}</article>`) : this.empty(this.languageCode === "nl" ? "Welkom in je gezinsomgeving" : "Welcome to your family space", this.languageCode === "nl" ? "Voeg je eerste familielid toe en koppel het Home Assistant-account." : "Add your first family member and link their Home Assistant user ID.", this.addButton(this.languageCode === "nl" ? "Persoon toevoegen" : "Add a person", "person", this.can("manage_people")))}</div>
      <div class="settings-grid"><article class="surface"><span class="eyebrow">${this.languageCode === "nl" ? "WEERGAVE & STANDAARDEN" : "DISPLAY & DEFAULTS"}</span><h3>${this.languageCode === "nl" ? "Stel jullie dagritme in" : "Set your everyday rhythm"}</h3><dl><div><dt>${this.languageCode === "nl" ? "Agenda" : "Calendar"}</dt><dd>${settings.default_calendar_view || "list"} ${this.languageCode === "nl" ? "weergave" : "view"} · ${this.languageCode === "nl" ? "week start" : "week starts"} ${settings.week_start || (this.languageCode === "nl" ? "volgens taal" : "by locale")}</dd></div><div><dt>${this.languageCode === "nl" ? "Dagoverzicht" : "Day overview"}</dt><dd>${settings.overview_position || "right"} · ${settings.overview_collapsed ? (this.languageCode === "nl" ? "ingeklapt" : "collapsed") : (this.languageCode === "nl" ? "uitgeklapt" : "expanded")}</dd></div><div><dt>${this.languageCode === "nl" ? "Tijd & taal" : "Time & language"}</dt><dd>${settings.time_format || "24"} ${this.languageCode === "nl" ? "uur" : "hour"} · ${settings.language || this.locale}</dd></div><div><dt>${this.languageCode === "nl" ? "Maaltijdvakken" : "Meal slots"}</dt><dd>${(settings.meal_slots || []).join(", ")}</dd></div><div><dt>${this.languageCode === "nl" ? "Winkels" : "Stores"}</dt><dd>${(settings.stores || []).join(", ") || (this.languageCode === "nl" ? "Nog geen winkels" : "No stores yet")}</dd></div><div><dt>${this.languageCode === "nl" ? "Boodschappen standaard" : "Grocery default"}</dt><dd>${this.groceryDefaultLabel(settings.default_grocery_list_id)}</dd></div><div><dt>${this.languageCode === "nl" ? "Competitie" : "Competition"}</dt><dd>${settings.competition_default || "week"}</dd></div><div><dt>${this.languageCode === "nl" ? "Sync-interval" : "Sync interval"}</dt><dd>${settings.sync_interval || 30} ${this.languageCode === "nl" ? "minuten" : "minutes"}</dd></div><div><dt>${this.languageCode === "nl" ? "Herinneringen" : "Reminders"}</dt><dd>${settings.reminders_enabled === false ? (this.languageCode === "nl" ? "Uit" : "Off") : `${settings.default_reminder_minutes ?? 15} min ${this.languageCode === "nl" ? "vooraf" : "before"} · ${settings.notify_service ? `notify.${settings.notify_service}` : (this.languageCode === "nl" ? "HA-meldingen" : "HA notifications")}${settings.daily_agenda_time ? ` · ${this.languageCode === "nl" ? "agenda om" : "agenda at"} ${settings.daily_agenda_time}` : ""}`}</dd></div></dl>${this.addButton(this.languageCode === "nl" ? "Voorkeuren bewerken" : "Edit preferences", "preferences", this.can("manage_settings"), { ...settings, theme: this.theme })}</article>
      <article class="surface"><span class="eyebrow">${this.languageCode === "nl" ? "MAAK HET EIGEN" : "MAKE YOURSELF AT HOME"}</span><h3>${this.languageCode === "nl" ? "Uiterlijk" : "Appearance"}</h3><p class="muted">${this.languageCode === "nl" ? "Kies een uiterlijk voor dit apparaat. Auto volgt je Home Assistant-thema." : "Choose a look for this device. Auto follows your Home Assistant theme."}</p><div class="theme-options" role="group" aria-label=${this.languageCode === "nl" ? "Uiterlijk" : "Appearance"}>${["auto", "light", "dark"].map(theme => html`<button class=${this.theme === theme ? "active" : ""} aria-pressed=${this.theme === theme} @click=${() => { this.theme = theme; localStorage.setItem("family-organizer-theme", theme); }}><span aria-hidden="true">${theme === "auto" ? "◐" : theme === "light" ? "☼" : "☾"}</span>${theme === "auto" ? (this.languageCode === "nl" ? "Auto" : "Auto") : theme === "light" ? (this.languageCode === "nl" ? "Licht" : "Light") : (this.languageCode === "nl" ? "Donker" : "Dark")}</button>`)}</div><hr><span class="eyebrow">${this.languageCode === "nl" ? "AGENDA-KOPPELINGEN" : "CALENDAR CONNECTIONS"}</span><h3>${this.languageCode === "nl" ? "Houd agenda’s in sync" : "Keep calendars in sync"}</h3><p class="muted">${this.languageCode === "nl" ? "Bronnen en inloggegevens worden veilig in Home Assistant beheerd, nooit in dit paneel." : "Sources and credentials are managed securely in Home Assistant, never in this panel."}</p><a class="button-link" href="/config/integrations/integration/family_organizer">${this.languageCode === "nl" ? "Open integratie-instellingen" : "Open integration settings"} →</a><p class="muted">${this.languageCode === "nl" ? "Instellingen → Apparaten & diensten → Family Organizer → Configureren." : "Settings → Devices & services → Family Organizer → Configure."}</p>${(this.data.calendar.sources || []).map((source: Item) => html`<div class="compact-row"><span class="event-dot" style=${`background:${this.color(source.color)}`}></span><strong>${source.name}</strong><span class="muted">${source.enabled === false ? (this.languageCode === "nl" ? "Uitgeschakeld" : "Disabled") : (this.languageCode === "nl" ? "Verbonden" : "Connected")}</span></div>`)}</article></div></section>`;
  }

  private field(label: string, name: string, value: unknown = "", type = "text", required = false, extra: Item = {}) {
    return html`<label>${this.x(label)}<input name=${name} type=${type} .value=${String(value ?? "")} ?required=${required} min=${extra.min ?? nothing} max=${extra.max ?? nothing} step=${extra.step ?? nothing} placeholder=${extra.placeholder ? this.x(extra.placeholder) : nothing} list=${extra.list ?? nothing} ?autofocus=${extra.autofocus || false}></label>`;
  }
  private select(label: string, name: string, value: string, options: [string, string][]) {
    const id = `editor-${name}`;
    return html`<div class="form-field"><label for=${id}>${this.x(label)}</label><select id=${id} name=${name}>${options.map(([valueId, title]) => html`<option value=${valueId} ?selected=${valueId === value}>${this.x(title)}</option>`)}</select></div>`;
  }
  private textarea(label: string, name: string, value = "", placeholder = "") { return html`<label class="full">${this.x(label)}<textarea name=${name} rows="4" .value=${value} placeholder=${this.x(placeholder)}></textarea></label>`; }
  private personChecks(name: string, selected: string[] = [], ownOnly = false) { return html`<fieldset class="full"><legend>${this.x("Family members")}</legend><div class="checkbox-group">${this.people.filter((p: Item) => !ownOnly || p.id === this.me?.id).map((p: Item) => html`<label class="check"><input type="checkbox" name=${name} value=${p.id} ?checked=${selected.includes(p.id)}>${this.avatar(p.id)}${p.name}</label>`)}</div></fieldset>`; }
  private shared(item: Item) { return html`<label class="check full"><input name="shared" type="checkbox" ?checked=${item.shared !== false}>${this.x("Share with the family")}</label>`; }
  private haUserPicker(item: Item) {
    const current = item.user_id || item.ha_user_id || "";
    const available = this.haUsers.filter((u: Item) => !u.person_id || u.person_id === item.id);
    return html`<div class="form-field full"><label for="editor-ha-user">${this.x("Copy from Home Assistant user")}</label>
      <select id="editor-ha-user" @change=${(e: Event) => this.applyHaUser((e.target as HTMLSelectElement).value)}>
        <option value="" ?selected=${!current}>${this.x("Don’t link a Home Assistant user")}</option>
        ${available.map((u: Item) => html`<option value=${u.id} ?selected=${u.id === current}>${u.name}</option>`)}
      </select>
      <label class="check"><input name="sync_picture" type="checkbox" ?checked=${!!item.sync_picture} ?disabled=${!current}>${this.x("Keep profile picture in sync with Home Assistant")}</label>
      <p class="muted">${this.x("Only users that aren’t linked to another family member are listed. The name and profile picture are copied over.")}</p></div>`;
  }
  private dialog() {
    const { kind, item } = this.editor!;
    const titles: Item = this.languageCode === "nl"
      ? { quick: "Wat wil je toevoegen?", "event-detail": item.title, event: item.id ? "Afspraakreeks bewerken" : "Afspraak toevoegen", grocery: item.id ? "Boodschappenitem bewerken" : "Aan boodschappenlijst toevoegen", list: item.id ? "Boodschappenlijst bewerken" : "Boodschappenlijst maken", todo: item.id ? "Taak bewerken" : "Taak toevoegen", todolist: item.id ? "Takenlijst bewerken" : "Takenlijst maken", journal: item.id ? "Dagboekitem bewerken" : "Nieuw dagboekitem", contact: item.id ? "Contact bewerken" : "Contact toevoegen", "recipe-import": "Recept van internet importeren", meal: item.id ? "Geplande maaltijd bewerken" : "Maaltijd plannen", chore: item.id ? "Klus bewerken" : "Klus inplannen", points: "Gezinspunten aanpassen", recipe: item.id ? "Recept bewerken" : "Favoriet recept opslaan", categories: "Receptcategorieën", category: item.id ? "Categorie bewerken" : "Categorie maken", person: item.id ? "Familielid bewerken" : "Familielid toevoegen", preferences: "Weergave & standaarden", delete: "Dit item verwijderen?" }
      : { quick: "What would you like to add?", "event-detail": item.title, event: item.id ? "Edit event series" : "Add an event", grocery: item.id ? "Edit shopping item" : "Add to your shopping list", list: item.id ? "Edit grocery list" : "Create a grocery list", todo: item.id ? "Edit to-do" : "Add a to-do", todolist: item.id ? "Edit to-do list" : "Create a to-do list", journal: item.id ? "Edit journal entry" : "New journal entry", contact: item.id ? "Edit contact" : "Add a contact", "recipe-import": "Import a recipe from the web", meal: item.id ? "Edit planned meal" : "Plan a meal", chore: item.id ? "Edit chore" : "Schedule a chore", points: "Adjust family points", recipe: item.id ? "Edit recipe" : "Save a favorite recipe", categories: "Recipe categories", category: item.id ? "Edit category" : "Create a category", person: item.id ? "Edit family member" : "Add a family member", preferences: "Display & defaults", delete: "Delete this item?" };
    const isForm = !["quick", "event-detail", "categories"].includes(kind);
    return html`<dialog class=${`editor-dialog ${kind === "event-detail" ? "detail-dialog" : ""}`} aria-labelledby="dialog-title" @cancel=${(e: Event) => { e.preventDefault(); this.closeEditor(); }} @click=${(e: MouseEvent) => { if (e.target === e.currentTarget) { const box = (e.currentTarget as HTMLElement).getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) this.closeEditor(); } }}>
      <header class="dialog-heading"><div><span class="eyebrow">FAMILY ORGANIZER</span><h2 id="dialog-title">${titles[kind]}</h2></div><button type="button" class="icon-button" aria-label=${this.t("close_dialog")} ?disabled=${this.saving} @click=${() => this.closeEditor()}>×</button></header>
      ${this.error ? html`<div class="banner error" role="alert">${this.error}</div>` : nothing}
      ${isForm ? html`<form @submit=${(e: SubmitEvent) => void this.saveEditor(e)}><fieldset class="form-fields" ?disabled=${this.saving}>${this.editorFields(kind, item)}</fieldset><footer class="dialog-footer"><span class="muted" role="status">${this.saving ? this.t("saving") : kind === "event" && item.recurrence ? (this.languageCode === "nl" ? "Wijzigingen gelden voor de hele reeks." : "Changes apply to the entire series.") : ""}</span><button type="button" ?disabled=${this.saving} @click=${() => this.closeEditor()}>${this.t("cancel")}</button><button class=${kind === "delete" ? "danger-primary" : "primary"} ?disabled=${this.saving}>${this.saving ? this.t("saving") : kind === "delete" ? this.t("delete") : this.t("save")}</button></footer></form>` : html`<div class="dialog-content">${kind === "quick" ? this.quickMenu() : kind === "event-detail" ? this.eventDetail(item) : this.categoryManager()}</div>`}
    </dialog>`;
  }
  private quickMenu() {
    const entries = [{ kind: "event", title: "Calendar event", description: "Make time for what matters", icon: "▦", enabled: this.canEvent(), item: { day: this.selectedDay } }, { kind: "grocery", title: "Shopping item", description: "Remember it before you forget it", icon: "▤", enabled: this.can("manage_groceries"), item: { list_id: this.listId } }, { kind: "todo", title: "To-do", description: "Get it off your mind and onto the list", icon: "☑", enabled: this.can("manage_todos"), item: { list_id: this.todoListId } }, { kind: "meal", title: "Planned meal", description: "Give dinner a little direction", icon: "♧", enabled: this.can("manage_meal_plan"), item: { day: this.selectedDay, slot: (this.settingsData.meal_slots || ["dinner"])[0], servings: 4 } }, { kind: "chore", title: "Family chore", description: "Share the load, celebrate the effort", icon: "✓", enabled: this.can("manage_chores"), item: {} }, { kind: "recipe", title: "Favorite recipe", description: "Keep a good thing close", icon: "♧", enabled: this.can("manage_recipes"), item: {} }, { kind: "journal", title: "Journal entry", description: "Save a moment worth remembering", icon: "✎", enabled: this.can("manage_journal"), item: { day: this.selectedDay } }, { kind: "contact", title: "Contact", description: "A number the whole family can find", icon: "☎", enabled: this.can("manage_contacts"), item: {} }];
    return html`<div class="quick-menu">${entries.filter(entry => entry.enabled).map(entry => html`<button @click=${() => this.openEditor(entry.kind, entry.item)}><span class="quick-icon" aria-hidden="true">${entry.icon}</span><span><strong>${this.x(entry.title)}</strong><small>${this.x(entry.description)}</small></span><span aria-hidden="true">→</span></button>`)}</div>
      ${entries.every(entry => !entry.enabled) ? this.empty(this.t("view_only"), this.t("ask_admin_permissions")) : nothing}`;
  }
  private eventDetail(event: Item) {
    return html`<div class="event-detail"><div class="detail-date" style=${`--event-color:${this.eventColor(event)}`}><span>${this.date(iso(new Date(event.occurrence_start)), { month: "short" })}</span><strong>${new Date(event.occurrence_start).getDate()}</strong></div><div><h3>${this.date(iso(new Date(event.occurrence_start)))}</h3><p>${event.all_day ? this.s("All day", "Hele dag") : `${this.time(event.occurrence_start)} – ${this.time(event.occurrence_end)}`}</p>${iso(new Date(event.occurrence_start)) !== iso(new Date(event.occurrence_end)) ? html`<p class="muted">${this.s("Ends", "Eindigt")} ${this.date(iso(new Date(event.all_day ? new Date(event.occurrence_end).getTime() - 1 : event.occurrence_end)))}</p>` : nothing}</div></div><dl class="event-metadata"><div><dt>${this.s("Where", "Waar")}</dt><dd>${event.location || this.s("No location", "Geen locatie")}</dd></div><div><dt>${this.s("Who", "Wie")}</dt><dd class="event-people">${(event.person_ids || []).map((id: string) => html`<span class="check">${this.avatar(id)}${this.person(id)?.name || this.s("Family member", "Familielid")}</span>`)}</dd></div><div><dt>${this.s("Repeats", "Herhaalt")}</dt><dd>${event.recurrence || this.s("Does not repeat", "Herhaalt niet")}</dd></div><div><dt>${this.s("Visibility", "Zichtbaarheid")}</dt><dd>${event.shared === false ? this.s("Private", "Privé") : this.s("Shared with family", "Gedeeld met gezin")}</dd></div></dl>${event.description ? html`<p class="event-description">${event.description}</p>` : nothing}${event.source_id ? html`<p class="muted">${this.s("Imported calendar event. Local edits may be replaced on the next source sync.", "Geïmporteerde agenda-afspraak. Lokale wijzigingen kunnen bij de volgende sync worden vervangen.")}</p>` : nothing}<div class="detail-actions">${this.canEvent(event) ? html`<button class="primary" @click=${() => this.openEditor("event", event)}>${this.s("Edit", "Bewerken")} ${event.recurrence ? this.s("series", "reeks") : this.s("event", "afspraak")}</button>` : nothing}${this.canEvent() ? html`<button @click=${() => { const duplicate: Item = duplicateEvent(event); if (!this.can("manage_calendar_all")) duplicate.person_ids = [this.me?.id].filter(Boolean); this.openEditor("event", duplicate); }}>${this.s("Duplicate", "Dupliceren")}</button>` : nothing}${this.canEvent(event) ? html`<button class="danger" @click=${() => this.confirmDelete("calendar", event)}>${this.s("Delete", "Verwijderen")} ${event.recurrence ? this.s("series", "reeks") : this.s("event", "afspraak")}</button>` : nothing}</div>`;
  }
  private categoryManager() { return html`${this.addButton("New category", "category", this.can("manage_recipes"))}<div class="category-list">${(this.data.recipes.categories || []).map((category: Item) => html`<div class="compact-row"><strong class="row-copy">${this.categoryPath(category)}</strong><button @click=${() => this.openEditor("category", category)}>${this.x("Edit")}</button><button class="danger" @click=${() => this.confirmDelete("recipes", category, "categories")}>${this.t("delete")}</button></div>`)}</div>`; }
  private editorFields(kind: string, item: Item) {
    if (kind === "delete") {
      const reason = this.editor?.collection === "lists" ? this.x(this.editor.resource === "todos" ? "All to-dos on this list will also be removed." : "All grocery items on this list will also be removed.")
        : this.editor?.collection === "categories" ? this.x("Recipes are kept. Child categories move to the parent.")
        : item.recurrence ? this.x("This removes the entire repeating event series.") : this.x("This cannot be undone.");
      return html`<div class="full"><p>${this.t("delete")} <strong>${item.title || item.name || this.x("this item")}</strong>?</p><p class="muted">${reason}</p></div>`;
    }
    if (kind === "event") {
      const localInput = (value?: string) => { if (!value) return ""; const date = new Date(value.length === 10 ? `${value}T00:00:00` : value); return `${iso(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; };
      const start = localInput(item.start), end = localInput(item.end), day = item.day || start.slice(0, 10) || this.selectedDay;
      const recurrence: [string, string][] = [["", "Does not repeat"], ["FREQ=DAILY", "Every day"], ["FREQ=WEEKLY", "Every week"], ["FREQ=MONTHLY", "Every month"], ["FREQ=YEARLY", "Every year"]];
      if (item.recurrence && !recurrence.some(([value]) => value === item.recurrence)) recurrence.push([item.recurrence, `${this.x("Keep existing:")} ${item.recurrence}`]);
      return html`${this.field("Event title", "title", item.title, "text", true, { autofocus: true })}${this.field("Location", "location", item.location)}${this.field("Starts on", "day", day, "date", true)}${this.field("Ends on (inclusive for all-day)", "end_day", item.all_day && end ? shift(end.slice(0, 10), -1) : end.slice(0, 10) || day, "date", true)}${this.field("Start time", "start", item.start_time || start.slice(11, 16) || "18:00", "time", true)}${this.field("End time", "end", item.end_time || end.slice(11, 16) || "19:00", "time", true)}<label class="check full"><input name="all_day" type="checkbox" ?checked=${!!item.all_day}>${this.x("All-day event (time fields are ignored)")}</label>${this.select("Repeat", "recurrence", item.recurrence || "", recurrence)}${this.select("Reminder", "reminder", item.reminder_minutes === null || item.reminder_minutes === undefined ? "" : String(item.reminder_minutes), [["", `${this.x("Family default")} (${this.settingsData.default_reminder_minutes ?? 15} min)`], ["-1", "No reminder"], ["0", "At start"], ["5", "5 minutes before"], ["15", "15 minutes before"], ["30", "30 minutes before"], ["60", "1 hour before"], ["120", "2 hours before"], ["1440", "1 day before"]])}${this.personChecks("person_ids", item.person_ids || (this.can("manage_calendar_all") ? [] : [this.me?.id]), !this.can("manage_calendar_all"))}${this.textarea("Notes", "description", item.description)}${this.shared(item)}`;
    }
    if (kind === "grocery") return html`${this.field("Item name", "name", item.name, "text", true, { autofocus: true })}${this.field("Quantity", "quantity", item.quantity ?? 1, "number", true, { min: .001, step: "any" })}${this.field("Unit", "unit", item.unit, "text", false, { placeholder: "cups, kg, packs…" })}${this.select("Grocery list", "list_id", item.list_id || this.listId, (this.data.groceries.lists || []).map((x: Item) => [x.id, x.name]))}<label>${this.x("Store")}<input name="store" list="store-options" .value=${item.store || ""}><datalist id="store-options">${(this.settingsData.stores || []).map((store: string) => html`<option value=${store}></option>`)}</datalist></label><label>${this.x("Assigned to")}<select name="assignee_id"><option value="">${this.x("Anyone")}</option>${this.peopleOptions(item.assignee_id)}</select></label>${this.textarea("Notes", "notes", item.notes)}${this.shared(item)}`;
    if (kind === "list") return html`${this.field("List name", "name", item.name, "text", true, { autofocus: true })}${this.field("Default store", "store", item.store)}${this.shared(item)}`;
    if (kind === "todo") return html`${this.field("What needs doing?", "title", item.title, "text", true, { autofocus: true })}${this.select("List", "list_id", item.list_id || this.todoListId, (this.data.todos?.lists || []).map((x: Item) => [x.id, x.name]))}${this.field("Due date", "due_date", item.due_date, "date")}<label>${this.x("Assigned to")}<select name="assignee_id"><option value="">${this.x("Anyone")}</option>${this.peopleOptions(item.assignee_id)}</select></label>${this.textarea("Notes", "notes", item.notes)}${this.shared(item)}`;
    if (kind === "todolist") return html`${this.field("List name", "name", item.name, "text", true, { autofocus: true })}${this.shared(item)}`;
    if (kind === "recipe-import") return html`${this.field("Recipe page URL", "url", item.url, "url", true, { autofocus: true, placeholder: "https://â€¦" })}<p class="muted full">${this.x("We read the recipe details most cooking sites publish, then let you review before saving.")}</p>`;
    if (kind === "contact") return html`${this.field("Name", "name", item.name, "text", true, { autofocus: true })}${this.field("Group", "group", item.group, "text", false, { list: "contact-groups", placeholder: "School, Doctors, Family, Friends…" })}<datalist id="contact-groups">${[...new Set<string>((this.data.contacts?.items || []).map((c: Item) => c.group).filter(Boolean))].map((g: string) => html`<option value=${g}></option>`)}</datalist>${this.textarea("Phone numbers (one per line)", "phones", (item.phones || []).join("\n"), "+31 6 1234 5678")}${this.textarea("Email addresses (one per line)", "emails", (item.emails || []).join("\n"), "name@example.com")}${this.field("Address", "address", item.address)}${this.textarea("Notes", "notes", item.notes, "Opening hours, who to ask for…")}${this.shared(item)}`;
    if (kind === "journal") return html`${this.field("Title", "title", item.title, "text", true, { autofocus: true })}${this.field("Date", "day", item.day || iso(new Date()), "date", true)}${this.textarea("What happened?", "body", item.body, "First steps, a big win, a funny thing someone said…")}${this.personChecks("person_ids", item.person_ids || [])}${this.textarea("Photo URLs (one per line)", "photos", (item.photos || []).join("\n"), "https://…")}${this.shared(item)}`;
    if (kind === "meal") return html`${this.field("Date", "day", item.day || this.selectedDay, "date", true)}${this.select("Meal slot", "slot", item.slot || item.meal || (this.settingsData.meal_slots || ["dinner"])[0], (this.settingsData.meal_slots || ["breakfast", "lunch", "dinner"]).map((slot: string) => [slot, slot]))}${this.select("Choose a recipe", "recipe_id", item.recipe_id || "", [["", "Use a meal name instead"], ...(this.data.recipes.items || []).map((r: Item): [string, string] => [r.id, r.title])])}${this.field("Meal name (if not using a recipe)", "title", item.title)}${this.field("Servings", "servings", item.servings || 4, "number", true, { min: .25, step: .25 })}`;
    if (kind === "chore") return html`${this.field("Chore title", "title", item.title, "text", true, { autofocus: true })}${this.field("Points", "points", item.points ?? 5, "number", true, { min: 0, step: 1 })}${this.field("Icon (MDI name)", "icon", item.icon || "mdi:check-circle-outline")}${this.select("Schedule", "schedule", item.schedule || "once", [["once", "One time"], ["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["custom", "Custom interval"], ...(item.schedule?.startsWith("weekly:") ? [[item.schedule, "Keep existing weekdays"] as [string, string]] : [])])}${this.personChecks("assignee_ids", item.assignee_ids || (item.assignee_id ? [item.assignee_id] : []))}<label class="check full"><input name="rotate" type="checkbox" ?checked=${!!item.rotate}>${this.x("Rotate between assignees after each completion")}</label><fieldset class="full"><legend>${this.x("Weekdays (weekly schedule)")}</legend><div class="checkbox-group">${Array.from({ length: 7 }, (_, i) => html`<label class="check"><input name="weekdays" type="checkbox" value=${i} ?checked=${(item.weekdays || []).includes(i)}>${this.date(shift("2026-06-01", i), { weekday: "long" })}</label>`)}</div></fieldset>${this.field("Day of month (monthly)", "month_day", item.month_day || 1, "number", true, { min: 1, max: 31 })}${this.field("Every N days (custom)", "interval_days", item.interval_days || 2, "number", true, { min: 1, max: 365 })}${this.field("Due date (one time)", "due_date", item.due_date || this.selectedDay, "date")}${this.field("Due time", "due_time", item.due_time, "time")}${this.textarea("Description", "description", item.description)}${this.shared(item)}`;
    if (kind === "points") return html`<label>${this.x("Family member")}<select name="person_id">${this.peopleOptions()}</select></label>${this.field("Points (negative to subtract)", "points", "", "number", true, { step: 1 })}${this.field("Reason", "note", "", "text", true)}`;
    if (kind === "recipe") return html`${this.field("Recipe title", "title", item.title, "text", true, { autofocus: true })}${this.field("Tags (comma separated)", "tags", (item.tags || []).join(", "))}${this.field("Image URL", "image", item.image, "url")}${this.field("Base servings", "servings", item.servings || 4, "number", true, { min: .25, step: .25 })}${this.field("Prep time (minutes)", "prep_time", item.prep_time || 0, "number", true, { min: 0, step: 1 })}${this.field("Cook time (minutes)", "cook_time", item.cook_time || 0, "number", true, { min: 0, step: 1 })}<fieldset class="full"><legend>${this.x("Categories")}</legend><div class="checkbox-group">${(this.data.recipes.categories || []).map((category: Item) => html`<label class="check"><input name="category_ids" type="checkbox" value=${category.id} ?checked=${(item.category_ids || []).includes(category.id)}>${this.categoryPath(category)}</label>`)}</div></fieldset>${this.textarea("Ingredients (one per line: quantity, optional unit, name)", "ingredients", serializeIngredients(item.ingredients || []), "1 cup flour\n2  eggs\n1/2 tsp salt")}${this.textarea("Method (one step per line)", "steps", (item.steps || item.instructions || []).join("\n"))}${this.shared(item)}`;
    if (kind === "category") {
      const isDescendant = (candidate: Item) => { const seen = new Set<string>(); let parent = candidate; while (parent) { if (parent.id === item.id || seen.has(parent.id)) return true; seen.add(parent.id); parent = (this.data.recipes.categories || []).find((c: Item) => c.id === parent.parent_id); } return false; };
      return html`${this.field("Category name", "name", item.name, "text", true, { autofocus: true })}${this.select("Parent category", "parent_id", item.parent_id || "", [["", "Root category"], ...(this.data.recipes.categories || []).filter((c: Item) => !isDescendant(c)).map((c: Item): [string, string] => [c.id, this.categoryPath(c)])])}`;
    }
    if (kind === "person") return html`${this.haUserPicker(item)}${this.field("Name", "name", item.name, "text", true, { autofocus: true })}${this.field("Family color", "color", this.color(item.color), "color")}${this.field("Home Assistant user ID", "user_id", item.user_id || item.ha_user_id)}
      ${this.field("Profile picture URL", "profile_picture", item.profile_picture || item.avatar_url, "url")}${this.field("Birthday", "birthday", item.birthday, "date")}
      ${this.select("Role preset", "role", item.role || "child", [["parent", "Parent (all rights)"], ["child", "Child (limited rights)"]])}
      ${this.field("PIN code (4-8 digits)", "pin", "", "password", !item.id, { inputmode: "numeric", minlength: 4, maxlength: 8, pattern: "[0-9]*", placeholder: item.has_pin ? "Enter new PIN to change" : "Set a PIN" })}
      ${item.id && item.has_pin ? html`<label class="check full"><input name="clear_pin" type="checkbox">${this.x("Remove existing PIN for this family member")}</label>` : nothing}
      <p class="muted full">${this.x("The user ID links this person’s Home Assistant account. Permission overrides take priority over their role preset.")}</p>
      <fieldset class="full permissions"><legend>${this.x("Permission overrides")}</legend>${capabilities.map(capability => this.select(this.x(capability.replaceAll("_", " ")), capability, typeof item.permissions?.[capability] === "boolean" ? item.permissions[capability] ? "allow" : "deny" : "default", [["default", "Use role preset"], ["allow", "Allow"], ["deny", "Deny"]]))}</fieldset>`;
    if (kind === "preferences") return html`${this.select("Appearance default", "theme", item.theme || "auto", [["auto", "Follow Home Assistant"], ["light", "Light"], ["dark", "Dark"]])}
      ${this.select("Day overview position", "overview_position", item.overview_position || "right", [["left", "Left"], ["right", "Right"]])}
      <label class="check full"><input name="overview_collapsed" type="checkbox" ?checked=${!!item.overview_collapsed}>${this.x("Collapse day overview by default")}</label>
      ${this.select("Week starts", "week_start", item.week_start || (this.firstDay === 0 ? "sunday" : "monday"), [["monday", "Monday"], ["sunday", "Sunday"]])}
      ${this.select("Time format", "time_format", item.time_format || "24", [["24", "24 hour"], ["12", "12 hour"]])}
      item.default_calendar_view || "list", [["list", "List"], ["month", "Month"], ["week", "Week"], ["day", "Day"]])}
      ${this.select("Grocery default", "default_grocery_list_id", item.default_grocery_list_id || this.listId, [["weekly", "Weekly groceries"], ["daily", "Daily groceries"], ["random", "Random list"], ...(this.data.groceries.lists || []).map((x: Item): [string, string] => [x.id, x.name])])}
      <fieldset class="full permissions"><legend>${this.x("Meal slots")}</legend>${["breakfast", "lunch", "dinner"].map(slot => html`<label class="check"><input name="meal_slots" type="checkbox" value=${slot} ?checked=${(item.meal_slots || ["breakfast", "lunch", "dinner"]).includes(slot)}>${this.x(slot[0].toUpperCase() + slot.slice(1))}</label>`)}</fieldset>
      ${this.field("Stores (comma separated)", "stores", (item.stores || []).join(", "))}
      ${this.select("Competition default", "competition_default", item.competition_default || "week", [["week", "Weekly"], ["month", "Monthly"]])}
      ${this.select("Language", "language", item.language || this.locale, [["en", "English"], ["nl", "Nederlands"]])}
      ${this.field("Calendar sync interval (minutes)", "sync_interval", item.sync_interval || 30, "number", true, { min: 5, max: 1440, step: 1 })}
      <label class="check full"><input name="reminders_enabled" type="checkbox" ?checked=${item.reminders_enabled !== false}>${this.x("Send event reminders")}</label>
      ${this.field("Default reminder (minutes before)", "default_reminder_minutes", item.default_reminder_minutes ?? 15, "number", true, { min: 0, max: 10080, step: 1 })}
      ${this.field("Notify service (e.g. mobile_app_phone)", "notify_service", item.notify_service || "", "text", false, { placeholder: "Leave empty for Home Assistant notifications" })}
      ${this.field("Daily agenda time (optional)", "daily_agenda_time", item.daily_agenda_time || "", "time")}`;
    return nothing;
  }
  static styles = panelStyles;
}
declare global { interface HTMLElementTagNameMap { "family-organizer-panel": FamilyOrganizerPanel } }
