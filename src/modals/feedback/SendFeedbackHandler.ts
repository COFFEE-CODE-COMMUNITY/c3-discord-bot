import { injectable } from "inversify"
import ModalHandler from "../../abstracts/ModalHandler"
import ModalId from "../../enums/ModalId"
import { ModalSubmitInteraction } from "discord.js"

@injectable()
class SendFeedbackHandler extends ModalHandler {
  public modalId: ModalId = ModalId.SendFeedback

  public async handle(interaction: ModalSubmitInteraction): Promise<void> {
    const topic = interaction.fields.getTextInputValue("topic")
    const message = interaction.fields.getTextInputValue("message")


    // Optionally, you can send the feedback to a specific channel or save it in a database
  }
}

export default SendFeedbackHandler