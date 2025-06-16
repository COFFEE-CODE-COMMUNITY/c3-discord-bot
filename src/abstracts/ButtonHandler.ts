import { ButtonInteraction } from "discord.js"

abstract class ButtonHandler {
  public abstract buttonId: string;

  public abstract handle(interaction: ButtonInteraction): void | Promise<void>;
}

export default ButtonHandler