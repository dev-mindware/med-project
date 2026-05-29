import { currentBlogPostStore, useModal } from "@/stores";
import { BlogPostResponse } from "@/types";

export function useBlogPostActions() {
  const { openModal } = useModal();
  const { setCurrentBlogPost } = currentBlogPostStore();

  const handleEdit = (blogPost: BlogPostResponse) => {
    setCurrentBlogPost(blogPost);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (blogPost: BlogPostResponse) => {
    setCurrentBlogPost(blogPost);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (blogPost: BlogPostResponse) => {
    setCurrentBlogPost(blogPost);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentBlogPost(undefined);
    openModal("ADD_MODAL");
  };

  const handleReview = (blogPost: BlogPostResponse) => {
    setCurrentBlogPost(blogPost);
    openModal("REVIEW_MODAL");
  };

  return { handleEdit, handleDetails, handleDelete, handleCreate, handleReview };
}
