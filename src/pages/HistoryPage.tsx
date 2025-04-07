import React, { useState, useEffect } from 'react'
import TableWithPagination from '@/components/TableWithPagination'
import Footer from '@/components/template/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/FormDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { set } from 'zod'
import { Button } from '@/components/ui/button'
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Index() {
  const [histories, setHistories] = useState({
    data: [],
    total: 0,
    from: 0,
    to: 0,
    per_page: 0,
    current_page: 0,
    next_page_url: null,
    prev_page_url: null,
  })

  const [savedHistories, setSavedHistories] = useState([]);

  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [form, setForm] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [deleteDialog, setOpenDeleteDialog] = useState(false);

  const columns = [
    {
      key: 'batch_no',
      label: 'Batch No.',
      hidden: false,
      render: (item: any) => (
        item.batch_no
      )
    },
    {
      key: 'shift_number',
      label: 'Shift No.',
      hidden: false,
      render: (item: any) => (
        item.shift_number
      )
    },
    {
      key: 'serial_no',
      label: 'Serial No.',
      hidden: false,
      render: (item: any) => (
        <Button size={'sm'} onClick={() => {
          setForm(item.labels)
          setOpenForm(true)
        }}>Open List</Button>
      )
    },
    {
      key: 'date',
      label: 'Date',
      hidden: false,
      render: (item: any) => (
        new Date(item.date).toLocaleDateString('en-GB')
      )
    },
  ]

  const actions: never[] = []

  const handleSearch = (query: string) => {
    try {
      if (!query) {
        // If query is empty, reset to full data
        setHistories({ ...histories, data: savedHistories });
        return;
      }

      // Always filter from initialData, not the current filtered state
      const filteredData = savedHistories.filter((item: any) =>
        item.batch_no?.toLowerCase().includes(query.toLowerCase())
      );

      setHistories({ ...histories, data: filteredData });
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  const handlePageChange = (url: string) => {
    // router.get(url, {}, { preserveState: true })
  }

  const handleAdd = (e: React.MouseEvent) => {
    setForm([])
    setOpenForm(true)
    setFormType('create')
  }

  const handleConfirmDelete = () => {
    // try {
    //   window.sqlite.delete_history(form.id).then((d: any) => {
    //     setOpenDeleteDialog(false)
    //   })
    // } catch (error) {
    //   console.log(error)
    // }
  }

  useEffect(() => {
    if (!deleteDialog || !openForm) {
      try {
        window.sqlite.get_labels().then((labels: any) => {
          window.sqlite.get_batchs().then((batchs: any) => {
            window.sqlite.get_products().then((products: any) => {
              console.log(products, labels, batchs)
              let data = batchs.map((batch: any) => ({
                ...batch,
                labels: labels.filter((label: any) => label.batch_id === batch.id),
                product: products.find((product: any) => product.id === parseInt(batch.product_id))
              }))
              setHistories({
                ...histories,
                data: data
              })
              setSavedHistories(data)
            })
          })
        })
      } catch (error) {
        console.log(error)
      }
    }
  }, [openForm, deleteDialog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // try {
    //   if (formType === 'create') {
    //     const submitData: any = await window.sqlite.create_historie(form);
    //     console.log(submitData)
    //     if (submitData) {
    //       setOpenForm(false);
    //     }
    //   } else {
    //     const submitData: any = await window.sqlite.update_historie(form);
    //     if (submitData) {
    //       setOpenForm(false);
    //     }
    //   }
    // } catch (error) {
    //   console.log(error)
    // }
  }

  return (
    <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
      <div className="flex flex-1 flex-col gap-2 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Search</h2>
        </div>
        <div className="flex flex-col gap-4">
          <TableWithPagination
            title="Search"
            description="Seach histories and view their data."
            columns={columns}
            data={histories?.data || []}
            pagination={{
              currentPage: histories?.current_page || 1,
              perPage: histories?.per_page || 10,
              total: histories?.total || 0,
              from: histories?.from || 0,
              to: histories?.to || 0,
              nextUrl: histories?.next_page_url || null,
              prevUrl: histories?.prev_page_url || null,
            }}
            actions={actions || []}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onAdd={handleAdd}
            canAdd={false}
            hideActions={true}
          />
        </div>
      </div>
      <Footer />

      {
        deleteDialog && (
          <ConfirmDialog
            open={deleteDialog}
            setConfirm={handleConfirmDelete}
            title="Confirm to delete?"
            setOpen={setOpenDeleteDialog}
          />
        )
      }

      {
        openForm && (
          <FormDialog
            setOpenForm={setOpenForm}
            openDialog={openForm}
            formType='view'
            setConfirmForm={handleSubmit}
            title={`Serial No Lists`}
            forms={<Form data={form} />}
            processing={false}
            size='lg:max-w-3xl'
          />
        )
      }
    </div>
  )
}

function Form(props: any) {
  const [data, setData] = useState(props.data);
  const columns = [
    {
      key: 'serial_no',
      label: 'Serial No.',
      hidden: false,
      render: (item: any) => (
        item.serial
      )
    },
    {
      key: 'qr_code',
      label: 'QR Code',
      hidden: false,
      render: (item: any) => (
        item.qr_code
      )
    },
    {
      key: 'status',
      label: 'Status',
      hidden: false,
      render: (item: any) => (
        item.status
      )
    },
  ];

  const actions: any[] = []

  const handleSearch = (query: string) => {
    try {
      setData(props.data.filter((item: any) => item.serial.toLowerCase().includes(query.toLowerCase())))
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePageChange = (url: string) => { }
  const handleAdd = (e: React.MouseEvent) => { }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] w-full">
      <div className="min-w-[600px]">
        <TableWithPagination
          title="Serial No Lists"
          description="view serial no lists"
          columns={columns}
          data={data || []}
          pagination={{
            currentPage: props?.current_page || 1,
            perPage: props?.per_page || 10,
            total: props?.total || 0,
            from: props?.from || 0,
            to: props?.to || 0,
            nextUrl: props?.next_page_url || null,
            prevUrl: props?.prev_page_url || null,
          }}
          actions={actions || []}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onAdd={handleAdd}
          canAdd={false}
          hideActions={true}
        />
      </div>
    </ScrollArea>
  )
}