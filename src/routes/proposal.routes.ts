import { ProposalController } from "./../controllers/proposal.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const proposalController = new ProposalController();
router.use(authorizedMiddleware);
router.post("/", uploads.none(), proposalController.createProposal);
router.get("/", proposalController.getAllProposals);
router.get("/:id", proposalController.getProposalById);
router.put("/:id", proposalController.updateProposal);
router.patch("/:id/status", proposalController.updateProposalStatus);
router.delete("/:id", proposalController.deleteProposal);

export default router;
