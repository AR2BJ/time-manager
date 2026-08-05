import { CalendarController } from "@/controllers/calendar.controller";
import { GlobalLoaderService } from "@/services/loader.service";
import { MatrixController } from "@/controllers/matrix.controller";
import { NavigationController } from "@/controllers/navigation.controller.js";
import { SettingsController } from "@/controllers/settings.controller";
import { ThemeController } from "@/controllers/theme.controller.js";
import { TimeController } from "@/controllers/time.controller.js";
import { TooltipController } from "@/controllers/tooltip.controller";
import { state } from "@/models/state.model";

const loader = document.querySelector("#app-loader");
const app = document.querySelector("#app");

app.classList.add("hidden");

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    loader.classList.add("opacity-0", "pointer-events-none");

    GlobalLoaderService.init();

    NavigationController.init();
    TimeController.init();
    CalendarController.init();
    MatrixController.init();
    SettingsController.init();

    TooltipController.init();

    ThemeController.init();

    requestAnimationFrame(() => {
      setTimeout(() => {
        loader.remove();
        app.classList.remove("hidden");
        TimeController.updateTabStyles(state.activeTab);
      }, 120);
    });
  }, 0);
});
