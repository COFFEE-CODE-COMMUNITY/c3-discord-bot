import ModalId from "../enums/ModalId"
import { ModalSubmitInteraction } from "discord.js"

abstract class ModalHandler {
  public abstract modalId: ModalId

  public abstract handle(interaction: ModalSubmitInteraction): void | Promise<void>
}

export default ModalHandler