import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

export function PaginationContainer() {
  return (
    <Pagination className="mt-2 mb-2">
      <PaginationContent className="">
        <PaginationItem>
          <PaginationPrevious href="" className="font-body" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="" isActive className="font-body">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
