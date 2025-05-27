import { z } from "zod"


export default function AddressSearch(){
    return (
        <div className="flex flex-col items-center w-full" >

        </div>
    )
}


const search = z.object({
    searchInput: z.string()
})

function SearchBar(){
}